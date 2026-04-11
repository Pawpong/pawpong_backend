import { Inject, Injectable } from '@nestjs/common';

import { NotificationType, RecipientType } from '../../../../../common/enum/user.enum';
import { MailTemplateService } from '../../../../../common/mail/mail-template.service';
import {
    NOTIFICATION_DISPATCH_PORT,
    type NotificationDispatchPort,
} from '../../../../notification/application/ports/notification-dispatch.port';
import type {
    BreederVerificationAdminNotifierPort,
    BreederVerificationAdminNotificationRecipient,
} from '../application/ports/breeder-verification-admin-notifier.port';

@Injectable()
export class BreederVerificationAdminNotifierAdapter implements BreederVerificationAdminNotifierPort {
    constructor(
        private readonly mailTemplateService: MailTemplateService,
        @Inject(NOTIFICATION_DISPATCH_PORT)
        private readonly notificationDispatchPort: NotificationDispatchPort,
    ) {}

    async sendApproval(recipient: BreederVerificationAdminNotificationRecipient): Promise<void> {
        const builder = this.notificationDispatchPort
            .to(recipient.breederId, RecipientType.BREEDER)
            .type(NotificationType.BREEDER_APPROVED)
            .title('🎉 포퐁 브리더 입점이 승인되었습니다!')
            .content('지금 프로필을 세팅하고 아이들 정보를 등록해보세요.')
            .related('/profile', 'page');

        if (recipient.emailAddress) {
            const emailContent = this.mailTemplateService.getBreederApprovalEmail(recipient.breederName);
            builder.withEmail({
                to: recipient.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            });
        }

        await builder.send();
    }

    async sendRejection(
        recipient: BreederVerificationAdminNotificationRecipient,
        rejectionReason?: string,
    ): Promise<void> {
        const rejectionReasons = rejectionReason ? rejectionReason.split('\n').filter((reason) => reason.trim()) : [];

        const builder = this.notificationDispatchPort
            .to(recipient.breederId, RecipientType.BREEDER)
            .type(NotificationType.BREEDER_REJECTED)
            .title('🐾 브리더 입점 심사 결과, 보완이 필요합니다.')
            .content('자세한 사유는 이메일을 확인해주세요.')
            .related('/profile', 'page');

        if (recipient.emailAddress) {
            const emailContent = this.mailTemplateService.getBreederRejectionEmail(
                recipient.breederName,
                rejectionReasons,
            );
            builder.withEmail({
                to: recipient.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            });
        }

        await builder.send();
    }

    async sendDocumentReminder(recipient: BreederVerificationAdminNotificationRecipient): Promise<void> {
        if (!recipient.emailAddress) {
            return;
        }

        const emailContent = this.mailTemplateService.getDocumentReminderEmail(recipient.breederName);

        await this.notificationDispatchPort
            .to(recipient.breederId, RecipientType.BREEDER)
            .type(NotificationType.DOCUMENT_REMINDER)
            .title('🐾 브리더 입점 절차가 아직 완료되지 않았어요!')
            .content('필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.')
            .related(recipient.breederId, 'profile')
            .withEmail({
                to: recipient.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            })
            .send();
    }
}
