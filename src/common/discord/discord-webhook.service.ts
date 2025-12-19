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
            this.logger.logWarning(
                'notifyAdopterRegistration',
                '디스코드 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.',
            );
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
        registrationType: 'email' | 'social';
        provider?: string;
        documents?: Array<{
            type: string;
            url: string;
            originalFileName?: string;
        }>;
    }): Promise<void> {
        if (!this.webhookUrl) {
            this.logger.logWarning(
                'notifyBreederRegistration',
                '디스코드 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.',
            );
            return;
        }

        try {
            const documentTypeMap: Record<string, string> = {
                id_card: '신분증',
                animal_production_license: '동물생산업 등록증',
                adoption_contract_sample: '표준 입양계약서 샘플',
                recent_pedigree_document: '최근 발급된 혈통서 사본',
                breeder_certification: '브리더 인증 서류',
            };

            const fields: Array<{ name: string; value: string; inline: boolean }> = [
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
                    name: '닉네임',
                    value: data.name,
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
            ];

            // 서류 제출 상태
            if (data.documents && data.documents.length > 0) {
                fields.push({
                    name: '📋 서류 제출 상태',
                    value: `${data.documents.length}개 서류 업로드 완료`,
                    inline: false,
                });

                // 업로드된 서류 목록
                data.documents.forEach((doc) => {
                    const docTypeName = documentTypeMap[doc.type] || doc.type;
                    const fileName = doc.originalFileName ? `\n파일명: ${doc.originalFileName}` : '';
                    fields.push({
                        name: `📄 ${docTypeName}`,
                        value: `[서류 보기](${doc.url})${fileName}`,
                        inline: false,
                    });
                });
            } else {
                fields.push({
                    name: '📋 서류 제출 상태',
                    value: '⏱️ 나중에 제출 예정 (서류 미등록)',
                    inline: false,
                });
            }

            const embed = {
                title: '🏢 새로운 브리더 회원가입',
                color: 0x2196f3, // 파란색
                fields,
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
     * 브리더 입점 서류 제출/수정 알림
     *
     * @param data 브리더 서류 제출 정보
     */
    async notifyBreederVerificationSubmission(data: {
        breederId: string;
        breederName: string;
        email: string;
        phone?: string;
        level: 'new' | 'elite';
        isResubmission: boolean;
        documents: Array<{
            type: string;
            url: string;
            originalFileName?: string;
        }>;
        submittedAt: Date;
    }): Promise<void> {
        if (!this.webhookUrl) {
            this.logger.logWarning(
                'notifyBreederVerificationSubmission',
                '디스코드 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.',
            );
            return;
        }

        try {
            const documentTypeMap: Record<string, string> = {
                idCard: '신분증 사본',
                businessLicense: '동물생산업 등록증',
                contractSample: '표준 입양계약서 샘플',
                breederDogCertificate: '강아지 브리더 인증 서류',
                breederCatCertificate: '고양이 브리더 인증 서류',
                breederCertificate: '브리더 인증 서류',
            };

            const levelName = data.level === 'new' ? 'New 레벨' : 'Elite 레벨';
            const submissionType = data.isResubmission ? '재제출' : '신규 제출';

            const fields: Array<{ name: string; value: string; inline: boolean }> = [
                {
                    name: '브리더 ID',
                    value: data.breederId,
                    inline: true,
                },
                {
                    name: '브리더명',
                    value: data.breederName,
                    inline: true,
                },
                {
                    name: '이메일',
                    value: data.email,
                    inline: true,
                },
                {
                    name: '전화번호',
                    value: data.phone || '미설정',
                    inline: true,
                },
                {
                    name: '입점 레벨',
                    value: levelName,
                    inline: true,
                },
                {
                    name: '제출 유형',
                    value: submissionType,
                    inline: true,
                },
                {
                    name: '📋 제출된 서류',
                    value: `총 ${data.documents.length}개 서류`,
                    inline: false,
                },
            ];

            // 업로드된 서류 목록
            data.documents.forEach((doc) => {
                const docTypeName = documentTypeMap[doc.type] || doc.type;
                const fileName = doc.originalFileName ? `\n파일명: ${doc.originalFileName}` : '';
                fields.push({
                    name: `📄 ${docTypeName}`,
                    value: `[서류 보기](${doc.url})${fileName}`,
                    inline: false,
                });
            });

            const embed = {
                title: data.isResubmission
                    ? '🔄 브리더 입점 서류 재제출'
                    : '📝 브리더 입점 서류 제출 (신규)',
                color: data.isResubmission ? 0xff9800 : 0x9c27b0, // 주황색 (재제출) / 보라색 (신규)
                fields,
                timestamp: data.submittedAt.toISOString(),
                footer: {
                    text: 'Pawpong Backend - 관리자 검토가 필요합니다',
                },
            };

            await axios.post(this.webhookUrl, {
                content: '<@&1410549218225029150>', // 역할 멘션
                embeds: [embed],
            });

            this.logger.logSuccess(
                'notifyBreederVerificationSubmission',
                '브리더 입점 서류 제출 알림 전송 완료',
                {
                    breederId: data.breederId,
                    isResubmission: data.isResubmission,
                },
            );
        } catch (error) {
            this.logger.logError('notifyBreederVerificationSubmission', '디스코드 웹훅 전송 실패', error);
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
