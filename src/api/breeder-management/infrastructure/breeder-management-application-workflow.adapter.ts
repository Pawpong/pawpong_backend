import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApplicationStatus } from '../../../common/enum/user.enum';
import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { MailService } from '../../../common/mail/mail.service';
import { NotificationType } from '../../../schema/notification.schema';
import { NotificationService } from '../../notification/notification.service';
import type {
    BreederManagementApplicationRecord,
    BreederManagementApplicationWorkflowPort,
    BreederManagementConsultationCompletedNotificationCommand,
} from '../application/ports/breeder-management-application-workflow.port';
import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';
import { BreederManagementAdopterRepository } from '../repository/breeder-management-adopter.repository';
import { BreederRepository } from '../repository/breeder.repository';

@Injectable()
export class BreederManagementApplicationWorkflowAdapter implements BreederManagementApplicationWorkflowPort {
    constructor(
        private readonly adoptionApplicationRepository: AdoptionApplicationRepository,
        private readonly breederRepository: BreederRepository,
        private readonly notificationService: NotificationService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
        private readonly breederManagementAdopterRepository: BreederManagementAdopterRepository,
    ) {}

    findApplicationByIdAndBreeder(
        applicationId: string,
        breederId: string,
    ): Promise<BreederManagementApplicationRecord | null> {
        return this.adoptionApplicationRepository.findByIdAndBreeder(
            applicationId,
            breederId,
        ) as Promise<BreederManagementApplicationRecord | null>;
    }

    async updateStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
        await this.adoptionApplicationRepository.updateStatus(applicationId, status);
    }

    async incrementCompletedAdoptions(breederId: string): Promise<void> {
        await this.breederRepository.incrementCompletedAdoptions(breederId);
    }

    async notifyConsultationCompleted(
        command: BreederManagementConsultationCompletedNotificationCommand,
    ): Promise<void> {
        try {
            const breeder = await this.breederRepository.findById(command.breederId);
            const adopter = await this.breederManagementAdopterRepository.findById(command.adopterId);

            this.logger.log(
                `[updateApplicationStatus] 브리더 조회 결과: ${breeder ? `찾음 (name: ${breeder.name})` : '없음'}`,
            );
            this.logger.log(
                `[updateApplicationStatus] 입양자 조회 결과: ${adopter ? `찾음 (email: ${adopter.emailAddress})` : '없음'}`,
            );

            if (!breeder || !adopter) {
                this.logger.logWarning(
                    'updateApplicationStatus',
                    '브리더 또는 입양자 정보를 찾을 수 없어 알림 발송 실패',
                    {
                        breederId: command.breederId,
                        adopterId: command.adopterId,
                    },
                );
                return;
            }

            this.logger.log(`[updateApplicationStatus] 알림 발송 대상 입양자 ID: ${command.adopterId}`);

            const breederDisplayName = breeder.name || breeder.nickname || '브리더';

            await this.notificationService.createNotification(
                command.adopterId,
                'adopter',
                NotificationType.CONSULT_COMPLETED,
                {
                    breederId: command.breederId,
                    breederName: breederDisplayName,
                    applicationId: command.applicationId,
                },
                `/applications/${command.applicationId}`,
            );

            this.logger.logSuccess('updateApplicationStatus', '상담 완료 인앱 알림 발송 완료', {
                adopterId: command.adopterId,
                breederName: breederDisplayName,
            });

            const appUrl = this.configService.get('APP_URL', 'https://pawpong.com');
            this.mailService
                .sendMail({
                    to: adopter.emailAddress,
                    subject: `${breederDisplayName}님과의 상담이 완료되었어요!`,
                    html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #4F3B2E;">🐾 상담이 완료되었습니다!</h2>
                                    <p>${breederDisplayName}님과의 상담이 완료되었어요.</p>
                                    <p>어떠셨는지 후기를 남겨주세요!</p>
                                    <div style="margin: 30px 0;">
                                        <a href="${appUrl}/applications/${command.applicationId}"
                                           style="background-color: #4F3B2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                            후기 작성하기
                                        </a>
                                    </div>
                                    <p style="color: #666; font-size: 12px;">
                                        이 이메일은 발신 전용입니다. 문의사항은 포퐁 고객센터를 이용해주세요.
                                    </p>
                                </div>
                            `,
                })
                .then(() => {
                    this.logger.logSuccess('updateApplicationStatus', '상담 완료 이메일 발송 완료', {
                        adopterEmail: adopter.emailAddress,
                        breederName: breeder.name,
                    });
                })
                .catch((emailError) => {
                    this.logger.logWarning('updateApplicationStatus', '상담 완료 이메일 발송 실패', {
                        error: emailError,
                    });
                });
        } catch (error) {
            this.logger.logError('updateApplicationStatus', '상담 완료 알림 발송 실패', error);
        }
    }
}
