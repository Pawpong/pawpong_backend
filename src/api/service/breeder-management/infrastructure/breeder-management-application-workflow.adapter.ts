import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApplicationStatus, PetStatus } from '../../../../common/enum/user.enum';
import { NotificationType } from '../../../../common/enum/user.enum';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { MailService } from '../../../../common/mail/mail.service';
import { SenderRole } from '../../../../schema/chat-message.schema';
import {
    CREATE_OR_GET_ROOM_USE_CASE,
    type CreateOrGetRoomUseCasePort,
} from '../../chat/application/ports/chat-interaction.port';
import {
    NOTIFICATION_DISPATCH_PORT,
    type NotificationDispatchPort,
} from '../../notification/application/ports/notification-dispatch.port';
import type {
    BreederManagementApplicationChatRoomCommand,
    BreederManagementApplicationRecord,
    BreederManagementApplicationStatusNotificationCommand,
    BreederManagementApplicationWorkflowPort,
} from '../application/ports/breeder-management-application-workflow.port';
import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';
import { AvailablePetManagementRepository } from '../repository/available-pet-management.repository';
import { BreederManagementAdopterRepository } from '../repository/breeder-management-adopter.repository';
import { BreederRepository } from '../repository/breeder.repository';

// 신청 상태별 알림 문구 — 상담완료/입양확정/거절 셋 다 입양자에게 알림을 보낸다.
// (거절은 대상 status가 없으니 여기 없는 상태면 알림을 보내지 않는다)
const STATUS_NOTIFICATION_CONTENT: Partial<
    Record<
        ApplicationStatus,
        {
            notificationType: NotificationType;
            emailSubject: (breederName: string) => string;
            emailHeading: string;
            emailBody: (breederName: string) => string;
            ctaLabel: string;
        }
    >
> = {
    [ApplicationStatus.CONSULTATION_COMPLETED]: {
        notificationType: NotificationType.CONSULT_COMPLETED,
        emailSubject: (breederName) => `${breederName}님과의 상담이 완료되었어요!`,
        emailHeading: '🐾 상담이 완료되었습니다!',
        emailBody: (breederName) => `${breederName}님과의 상담이 완료되었어요. 어떠셨는지 후기를 남겨주세요!`,
        ctaLabel: '후기 작성하기',
    },
    [ApplicationStatus.ADOPTION_APPROVED]: {
        notificationType: NotificationType.ADOPTION_APPROVED,
        emailSubject: (breederName) => `${breederName}님과의 입양이 확정됐어요!`,
        emailHeading: '🎉 입양이 확정됐습니다!',
        emailBody: (breederName) =>
            `${breederName}님과의 입양이 확정됐어요. 축하드려요! 반려 생활 후기도 꼭 남겨주세요.`,
        ctaLabel: '후기 작성하기',
    },
    [ApplicationStatus.ADOPTION_REJECTED]: {
        notificationType: NotificationType.ADOPTION_REJECTED,
        emailSubject: () => '입양 신청 결과를 안내드려요',
        emailHeading: '신청 결과를 안내드려요',
        emailBody: (breederName) => `${breederName}님과의 신청이 이번엔 아쉽게 연결되지 못했어요.`,
        ctaLabel: '신청 확인하기',
    },
};

@Injectable()
export class BreederManagementApplicationWorkflowAdapter implements BreederManagementApplicationWorkflowPort {
    constructor(
        private readonly adoptionApplicationRepository: AdoptionApplicationRepository,
        private readonly breederRepository: BreederRepository,
        @Inject(NOTIFICATION_DISPATCH_PORT)
        private readonly notificationDispatchPort: NotificationDispatchPort,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
        private readonly breederManagementAdopterRepository: BreederManagementAdopterRepository,
        private readonly availablePetManagementRepository: AvailablePetManagementRepository,
        @Inject(CREATE_OR_GET_ROOM_USE_CASE)
        private readonly createOrGetRoomUseCase: CreateOrGetRoomUseCasePort,
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

    async recordApplicationApproval(applicationId: string, approvedAt: Date): Promise<void> {
        await this.adoptionApplicationRepository.recordApprovedAt(applicationId, approvedAt);
    }

    async markPetAsAdopted(petId: string, adoptedAt: Date): Promise<void> {
        await this.availablePetManagementRepository.update(petId, { status: PetStatus.ADOPTED, adoptedAt });
    }

    async rejectOtherOpenApplicationsForPet(petId: string, approvedApplicationId: string): Promise<number> {
        return this.adoptionApplicationRepository.rejectOtherOpenApplicationsForPet(petId, approvedApplicationId);
    }

    /**
     * 확정 시 입양자-브리더 채팅방 보장.
     * chat 도메인의 create-or-get 유스케이스를 포트로 재사용하므로 이미 방이 있으면 재활용되고
     * applicationId 만 덧붙는다(멱등). 프론트가 '채팅하기'에서 같은 경로를 다시 호출해도 동일한 방이 나온다.
     * 방 생성 실패는 로깅만 하고 삼킨다 — 입양 확정 자체를 되돌리면 안 된다.
     */
    async ensureChatRoomForApplication(command: BreederManagementApplicationChatRoomCommand): Promise<void> {
        try {
            const room = await this.createOrGetRoomUseCase.execute(command.breederId, SenderRole.BREEDER, {
                counterpartUserId: command.adopterId,
                applicationId: command.applicationId,
            });
            this.logger.logSuccess('updateApplicationStatus', '입양 확정 채팅방 보장 완료', {
                applicationId: command.applicationId,
                roomId: room.id,
            });
        } catch (error) {
            this.logger.logError('updateApplicationStatus', '입양 확정 채팅방 생성 실패', error);
        }
    }

    async notifyApplicationStatusChanged(
        command: BreederManagementApplicationStatusNotificationCommand,
    ): Promise<void> {
        const content = STATUS_NOTIFICATION_CONTENT[command.status];
        if (!content) return;

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
            // 프론트 실제 라우트는 /activity/applications/{id} — 예전에 /applications/{id}로 나가 404났었다.
            // view=sent — 수신자(adopterId)는 이 신청을 "보낸" 쪽이다(브리더가 신청자여도 마찬가지).
            // 프론트가 role만으로 보낸/받은 상세를 구분하므로 명시하지 않으면 브리더 수신자가
            // 자기가 받은 신청 화면으로 잘못 연결된다.
            const targetPath = `/activity/applications/${command.applicationId}?view=sent`;

            await this.notificationDispatchPort.createNotification(
                command.adopterId,
                'adopter',
                content.notificationType,
                {
                    breederId: command.breederId,
                    breederName: breederDisplayName,
                    applicationId: command.applicationId,
                },
                targetPath,
            );

            this.logger.logSuccess('updateApplicationStatus', '신청 상태 변경 인앱 알림 발송 완료', {
                adopterId: command.adopterId,
                breederName: breederDisplayName,
                status: command.status,
            });

            const appUrl = this.configService.get('APP_URL', 'https://pawpong.com');
            this.mailService
                .sendMail({
                    to: adopter.emailAddress,
                    subject: content.emailSubject(breederDisplayName),
                    html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #4F3B2E;">${content.emailHeading}</h2>
                                    <p>${content.emailBody(breederDisplayName)}</p>
                                    <div style="margin: 30px 0;">
                                        <a href="${appUrl}${targetPath}"
                                           style="background-color: #4F3B2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                            ${content.ctaLabel}
                                        </a>
                                    </div>
                                    <p style="color: #666; font-size: 12px;">
                                        이 이메일은 발신 전용입니다. 문의사항은 포퐁 고객센터를 이용해주세요.
                                    </p>
                                </div>
                            `,
                })
                .then(() => {
                    this.logger.logSuccess('updateApplicationStatus', '신청 상태 변경 이메일 발송 완료', {
                        adopterEmail: adopter.emailAddress,
                        breederName: breeder.name,
                    });
                })
                .catch((emailError) => {
                    this.logger.logWarning('updateApplicationStatus', '신청 상태 변경 이메일 발송 실패', {
                        error: emailError,
                    });
                });
        } catch (error) {
            this.logger.logError('updateApplicationStatus', '신청 상태 변경 알림 발송 실패', error);
        }
    }
}
