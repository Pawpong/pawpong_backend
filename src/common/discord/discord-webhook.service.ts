import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { CustomLoggerService } from '../logger/custom-logger.service';

/**
 * 디스코드 웹훅 알림 서비스
 *
 * 회원가입, 중요 이벤트 등을 디스코드로 실시간 알림 전송
 */
@Injectable()
export class DiscordWebhookService {
    private readonly webhookUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {
        this.webhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL') || '';

        if (!this.webhookUrl) {
            this.logger.logWarning('DiscordWebhookService', '디스코드 웹훅 URL이 설정되지 않았습니다.');
        }
    }

    /**
     * 입양자 회원가입 알림
     *
     * @param data 입양자 회원가입 정보
     */
    async notifyAdopterRegistration(data: {
        userId: string;
        email: string;
        name: string;
        phone?: string;
        nickname?: string;
        registrationType: 'email' | 'social';
        provider?: string;
    }): Promise<void> {
        if (!this.webhookUrl) {
            this.logger.logWarning('notifyAdopterRegistration', '디스코드 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.');
            return;
        }

        try {
            const embed = {
                title: '🐾 새로운 입양자 회원가입',
                color: 0x4caf50, // 녹색
                fields: [
                    {
                        name: '사용자 ID',
                        value: data.userId,
                        inline: true,
                    },
                    {
                        name: '이메일',
                        value: data.email,
                        inline: true,
                    },
                    {
                        name: '이름',
                        value: data.name,
                        inline: true,
                    },
                    {
                        name: '닉네임',
                        value: data.nickname || '미설정',
                        inline: true,
                    },
                    {
                        name: '전화번호',
                        value: data.phone || '미설정',
                        inline: true,
                    },
                    {
                        name: '가입 유형',
                        value: data.registrationType === 'email' ? '이메일' : `소셜 (${data.provider || '알 수 없음'})`,
                        inline: true,
                    },
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Pawpong Backend',
                },
            };

            await axios.post(this.webhookUrl, {
                embeds: [embed],
            });

            this.logger.logSuccess('notifyAdopterRegistration', '입양자 회원가입 알림 전송 완료', {
                userId: data.userId,
                email: data.email,
            });
        } catch (error) {
            this.logger.logError('notifyAdopterRegistration', '디스코드 웹훅 전송 실패', error);
        }
    }

    /**
     * 브리더 회원가입 알림
     *
     * @param data 브리더 회원가입 정보
     */
    async notifyBreederRegistration(data: {
        userId: string;
        email: string;
        name: string;
        phone?: string;
        businessNumber?: string;
        businessName?: string;
        registrationType: 'email' | 'social';
        provider?: string;
    }): Promise<void> {
        if (!this.webhookUrl) {
            this.logger.logWarning('notifyBreederRegistration', '디스코드 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.');
            return;
        }

        try {
            const embed = {
                title: '🏢 새로운 브리더 회원가입',
                color: 0x2196f3, // 파란색
                fields: [
                    {
                        name: '사용자 ID',
                        value: data.userId,
                        inline: true,
                    },
                    {
                        name: '이메일',
                        value: data.email,
                        inline: true,
                    },
                    {
                        name: '이름',
                        value: data.name,
                        inline: true,
                    },
                    {
                        name: '전화번호',
                        value: data.phone || '미설정',
                        inline: true,
                    },
                    {
                        name: '사업자 등록번호',
                        value: data.businessNumber || '미설정',
                        inline: true,
                    },
                    {
                        name: '상호명',
                        value: data.businessName || '미설정',
                        inline: true,
                    },
                    {
                        name: '가입 유형',
                        value: data.registrationType === 'email' ? '이메일' : `소셜 (${data.provider || '알 수 없음'})`,
                        inline: true,
                    },
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Pawpong Backend',
                },
            };

            await axios.post(this.webhookUrl, {
                embeds: [embed],
            });

            this.logger.logSuccess('notifyBreederRegistration', '브리더 회원가입 알림 전송 완료', {
                userId: data.userId,
                email: data.email,
            });
        } catch (error) {
            this.logger.logError('notifyBreederRegistration', '디스코드 웹훅 전송 실패', error);
        }
    }

    /**
     * 일반 알림 전송
     *
     * @param title 알림 제목
     * @param message 알림 메시지
     * @param color 임베드 색상 (기본: 회색)
     */
    async sendNotification(title: string, message: string, color: number = 0x9e9e9e): Promise<void> {
        if (!this.webhookUrl) {
            this.logger.logWarning('sendNotification', '디스코드 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.');
            return;
        }

        try {
            const embed = {
                title,
                description: message,
                color,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Pawpong Backend',
                },
            };

            await axios.post(this.webhookUrl, {
                embeds: [embed],
            });

            this.logger.logSuccess('sendNotification', '디스코드 알림 전송 완료', { title });
        } catch (error) {
            this.logger.logError('sendNotification', '디스코드 웹훅 전송 실패', error);
        }
    }
}
