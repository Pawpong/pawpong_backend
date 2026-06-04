import { Inject, Injectable, Logger } from '@nestjs/common';

import { RecipientType } from '../../../common/enum/user.enum';
import { MailTemplateService } from '../../../common/mail/mail-template.service';
import { AlimtalkService } from '../../../common/alimtalk/alimtalk.service';
import { NotificationType } from '../../../common/enum/user.enum';
import {
    NOTIFICATION_DISPATCH_PORT,
    type NotificationDispatchPort,
} from '../../notification/application/ports/notification-dispatch.port';
import type { AdopterApplicationNotifierPort } from '../application/ports/adopter-application-notifier.port';
import type {
    AdopterApplicationBreederNotificationTarget,
    AdopterApplicationConfirmationTarget,
} from '../application/ports/adopter-application-notifier.port';

@Injectable()
export class AdopterApplicationNotifierAdapter implements AdopterApplicationNotifierPort {
    private readonly logger = new Logger(AdopterApplicationNotifierAdapter.name);

    constructor(
        private readonly mailTemplateService: MailTemplateService,
        private readonly alimtalkService: AlimtalkService,
        @Inject(NOTIFICATION_DISPATCH_PORT)
        private readonly notificationDispatchPort: NotificationDispatchPort,
    ) {}

    async notifyBreederOfNewApplication(target: AdopterApplicationBreederNotificationTarget): Promise<void> {
        const breederId = target._id.toString();
        const breederDisplayName = target.name || target.nickname || '브리더';
        const emailContent = target.emailAddress
            ? this.mailTemplateService.getNewApplicationEmail(breederDisplayName)
            : null;

        const builder = this.notificationDispatchPort
            .to(breederId, RecipientType.BREEDER)
            .type(NotificationType.NEW_CONSULT_REQUEST)
            .title('💬 새로운 입양 상담 신청이 도착했어요!')
            .content('지금 확인해보세요.')
            .related('/application', 'page');

        if (emailContent && target.emailAddress) {
            builder.withEmail({
                to: target.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            });
        }

        builder.withPush();
        await builder.send();

        // 브리더에게 카카오 알림톡 발송 (CONSULTATION_REQUEST 템플릿)
        // 알림톡 발송 실패가 상담 신청 자체를 실패시키면 안 되므로 fire-and-forget + 에러 로깅 처리한다.
        if (target.phoneNumber) {
            this.alimtalkService.sendConsultationRequest(target.phoneNumber).catch((error) => {
                this.logger.warn(
                    `[notifyBreederOfNewApplication] 상담 신청 알림톡 발송 실패 (breederId: ${breederId}): ${error?.message ?? error}`,
                );
            });
        } else {
            this.logger.warn(
                `[notifyBreederOfNewApplication] 브리더 전화번호가 없어 알림톡을 발송하지 못했습니다 (breederId: ${breederId})`,
            );
        }
    }

    async notifyApplicantApplicationConfirmed(target: AdopterApplicationConfirmationTarget): Promise<void> {
        const emailContent = target.applicantEmail
            ? this.mailTemplateService.getApplicationConfirmationEmail(target.applicantName, target.breederName)
            : null;

        const recipientType = target.applicantRole === 'breeder' ? RecipientType.BREEDER : RecipientType.ADOPTER;

        const builder = this.notificationDispatchPort
            .to(target.applicantId, recipientType)
            .type(NotificationType.CONSULT_REQUEST_CONFIRMED)
            .title('✅ 상담 신청이 접수되었습니다!')
            .content(`${target.breederName}님이 확인 후 연락드릴 예정입니다.`)
            .metadata({ breederName: target.breederName })
            .related(target.applicantId, 'applications');

        if (emailContent && target.applicantEmail) {
            builder.withEmail({
                to: target.applicantEmail,
                subject: emailContent.subject,
                html: emailContent.html,
            });
        }

        builder.withPush();
        await builder.send();
    }
}
