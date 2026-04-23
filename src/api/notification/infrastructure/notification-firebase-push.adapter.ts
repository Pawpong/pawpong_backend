import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { BatchResponse, Messaging } from 'firebase-admin/messaging';
import * as fs from 'fs';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import type {
    NotificationPushDeliveryResult,
    NotificationPushMessage,
    NotificationPushPort,
} from '../application/ports/notification-push.port';

/**
 * Firebase Admin SDK 기반 푸시 어댑터.
 *
 * 초기화 전략:
 * - FCM_SERVICE_ACCOUNT_JSON: JSON 문자열 자체 (프로덕션 권장)
 * - FCM_SERVICE_ACCOUNT_PATH: 로컬 파일 경로 (개발 편의)
 * - 둘 다 없으면 초기화 skip, sendToTokens 호출 시 no-op + 경고 (개발 환경에서 막지 않음)
 *
 * 무효 토큰 판정:
 * - 'messaging/registration-token-not-registered'
 * - 'messaging/invalid-registration-token'
 * - 'messaging/invalid-argument' (형식 오류)
 */
@Injectable()
export class NotificationFirebasePushAdapter implements NotificationPushPort, OnModuleInit {
    private messaging: Messaging | null = null;
    private initialized = false;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {}

    onModuleInit(): void {
        this.tryInitialize();
    }

    async sendToTokens(
        tokens: string[],
        message: NotificationPushMessage,
    ): Promise<NotificationPushDeliveryResult[]> {
        if (tokens.length === 0) {
            return [];
        }

        if (!this.messaging) {
            this.logger.logWarning('firebasePush', 'FCM 미초기화 상태 - 발송 skip', { tokenCount: tokens.length });
            return tokens.map((token) => ({
                token,
                success: false,
                invalidToken: false,
                error: 'fcm-not-initialized',
            }));
        }

        const dataPayload: Record<string, string> = {
            ...(message.data ?? {}),
        };
        if (message.targetUrl) {
            dataPayload.targetUrl = message.targetUrl;
        }

        try {
            const response: BatchResponse = await this.messaging.sendEachForMulticast({
                tokens,
                notification: {
                    title: message.title,
                    body: message.body,
                },
                data: dataPayload,
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                        },
                    },
                },
            });

            return response.responses.map((result, index) => {
                const token = tokens[index];
                if (result.success) {
                    return { token, success: true, invalidToken: false };
                }

                const errorCode = result.error?.code ?? 'unknown';
                const invalidToken =
                    errorCode === 'messaging/registration-token-not-registered' ||
                    errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/invalid-argument';

                return {
                    token,
                    success: false,
                    invalidToken,
                    error: errorCode,
                };
            });
        } catch (error) {
            this.logger.logError('firebasePush', 'FCM 발송 예외', error);
            const message = error instanceof Error ? error.message : String(error);
            return tokens.map((token) => ({ token, success: false, invalidToken: false, error: message }));
        }
    }

    private tryInitialize(): void {
        if (this.initialized) return;

        const json = this.configService.get<string>('FCM_SERVICE_ACCOUNT_JSON');
        const path = this.configService.get<string>('FCM_SERVICE_ACCOUNT_PATH');

        let credential: admin.credential.Credential | null = null;

        if (json) {
            try {
                const parsed = JSON.parse(json) as admin.ServiceAccount;
                credential = admin.credential.cert(parsed);
            } catch (error) {
                this.logger.logError('firebasePush', 'FCM_SERVICE_ACCOUNT_JSON 파싱 실패', error);
            }
        } else if (path && fs.existsSync(path)) {
            try {
                const raw = fs.readFileSync(path, 'utf8');
                const parsed = JSON.parse(raw) as admin.ServiceAccount;
                credential = admin.credential.cert(parsed);
            } catch (error) {
                this.logger.logError('firebasePush', 'FCM_SERVICE_ACCOUNT_PATH 읽기 실패', error);
            }
        }

        if (!credential) {
            this.logger.logWarning(
                'firebasePush',
                'FCM 자격 증명 없음 - 푸시 비활성 (로컬 개발 모드)',
                {},
            );
            this.initialized = true;
            return;
        }

        const existing = admin.apps.find((app) => app?.name === 'pawpong-fcm') as App | undefined;
        const app = existing ?? admin.initializeApp({ credential }, 'pawpong-fcm');

        this.messaging = admin.messaging(app);
        this.initialized = true;
        this.logger.logSuccess('firebasePush', 'FCM 초기화 완료', {});
    }
}
