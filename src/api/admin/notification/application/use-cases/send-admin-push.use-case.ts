import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import { NotificationType } from '../../../../../common/enum/user.enum';
import {
    NOTIFICATION_COMMAND_PORT,
    type NotificationCommandPort,
} from '../../../../service/notification/application/ports/notification-command.port';
import {
    NOTIFICATION_PUSH_PORT,
    type NotificationPushPort,
} from '../../../../service/notification/application/ports/notification-push.port';
import { AdminPushTargetValidatorService } from '../../domain/services/admin-push-target-validator.service';
import {
    ADMIN_PUSH_RECIPIENT_READER_PORT,
    type AdminPushRecipientReaderPort,
} from '../ports/admin-push-recipient-reader.port';
import type { AdminPushDispatchResult, SendAdminPushCommand } from '../types/admin-push.type';
import {
    NOTIFICATION_PUSH_TOKEN_STORE_PORT,
    type NotificationPushTokenStorePort,
} from '../../../../service/notification/application/ports/notification-push-token-store.port';
import {
    NOTIFICATION_DEVICE_REGISTRY_PORT,
    type NotificationDeviceRegistryPort,
} from '../../../../service/notification/application/ports/notification-device-registry.port';

const FCM_MULTICAST_CHUNK = 500; // FCM sendEachForMulticast 한도

/**
 * v2 어드민 푸시 발송 use-case.
 *
 * Flow:
 * 1. target 검증 (individual 일 때 userId/role 필수)
 * 2. 수신자 + 토큰 일괄 조회
 * 3. 사용자별 in-app notification doc 생성 (createMany 가 없어서 loop)
 * 4. 토큰을 500개 chunk 로 나눠 FCM 멀티캐스트
 * 5. 성공/실패/무효 토큰 카운트 집계 후 반환
 */
@Injectable()
export class SendAdminPushUseCase {
    private readonly logger = new Logger(SendAdminPushUseCase.name);

    constructor(
        @Inject(ADMIN_PUSH_RECIPIENT_READER_PORT)
        private readonly recipientReader: AdminPushRecipientReaderPort,
        @Inject(NOTIFICATION_COMMAND_PORT)
        private readonly notificationCommand: NotificationCommandPort,
        @Inject(NOTIFICATION_PUSH_PORT)
        private readonly notificationPush: NotificationPushPort,
        private readonly validator: AdminPushTargetValidatorService,
        @Inject(NOTIFICATION_PUSH_TOKEN_STORE_PORT) private readonly tokenStore: NotificationPushTokenStorePort,
        @Inject(NOTIFICATION_DEVICE_REGISTRY_PORT) private readonly deviceRegistry: NotificationDeviceRegistryPort,
    ) {}

    async execute(command: SendAdminPushCommand): Promise<AdminPushDispatchResult> {
        this.validator.validate(command.target);
        this.validator.validateTargetUrl(command.targetUrl);
        if (command.purpose !== 'service' && command.purpose !== 'marketing') {
            throw new BadRequestException('발송 목적을 선택해주세요.');
        }

        const title = command.title.trim();
        const body = command.body.trim();
        if (title.length === 0) throw new BadRequestException('제목을 입력해주세요.');
        if (body.length === 0) throw new BadRequestException('본문을 입력해주세요.');

        const candidates = await this.recipientReader.readRecipients(command.target);
        const recipients = command.purpose === 'marketing'
            ? candidates.filter((recipient) => recipient.marketingAgreed === true)
            : candidates;

        if (command.target.type === 'individual' && candidates.length === 0) {
            throw new BadRequestException('대상 사용자를 찾을 수 없습니다.');
        }
        if (command.target.type === 'individual' && recipients.length === 0) {
            throw new BadRequestException('대상 사용자가 마케팅 수신에 동의하지 않았습니다.');
        }

        // 1) in-app notification doc 일괄 생성 (토큰 없는 사용자도 알림 탭에는 보이도록 모든 recipients 대상)
        let notificationsCreated = 0;
        try {
            await this.notificationCommand.createMany(
                recipients.map((r) => ({
                    userId: r.userId,
                    userRole: r.userRole,
                    type: NotificationType.ADMIN_BROADCAST,
                    title,
                    body,
                    targetUrl: command.targetUrl,
                })),
            );
            notificationsCreated = recipients.length;
        } catch (err) {
            // insertMany ordered:false — 일부 실패 시에도 나머지는 삽입됨. 전체 카운트는 보수적으로 0 처리.
            this.logger.warn(`[sendAdminPush] 일부 in-app notification 생성 실패: ${String(err)}`);
        }

        // 2) 토큰 평탄화 + FCM 500개 chunk 발송
        const allTokens = [...new Set(recipients.flatMap((r) => r.tokens))];
        let pushSuccess = 0;
        let pushFailed = 0;
        let invalidTokens = 0;

        for (let i = 0; i < allTokens.length; i += FCM_MULTICAST_CHUNK) {
            const chunk = allTokens.slice(i, i + FCM_MULTICAST_CHUNK);
            const results = await this.notificationPush.sendToTokens(chunk, {
                title,
                body,
                targetUrl: command.targetUrl,
            });
            for (const r of results) {
                if (r.success) pushSuccess += 1;
                else pushFailed += 1;
                if (r.invalidToken) invalidTokens += 1;
            }
            const invalid = results.filter((result) => result.invalidToken).map((result) => result.token);
            if (invalid.length > 0) {
                await this.deviceRegistry.removeTokens(invalid);
                await Promise.all(
                    recipients.map((recipient) =>
                        this.tokenStore.purgeInvalidTokens(
                            recipient.userId,
                            recipient.userRole,
                            invalid.filter((token) => recipient.tokens.includes(token)),
                        ),
                    ),
                );
            }
        }

        return {
            recipients: recipients.length,
            notificationsCreated,
            pushTokensTargeted: allTokens.length,
            pushSuccess,
            pushFailed,
            invalidTokens,
        };
    }
}
