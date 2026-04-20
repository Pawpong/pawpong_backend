import { Inject, Injectable } from '@nestjs/common';

import { RecipientType } from '../../../common/enum/user.enum';
import { MailTemplateService } from '../../../common/mail/mail-template.service';
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
    constructor(
        private readonly mailTemplateService: MailTemplateService,
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

        await builder.send();
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

        await builder.send();
    }
}
