import { Inject, Injectable } from '@nestjs/common';

import { NotificationType, RecipientType } from '../../../common/enum/user.enum';
import { MailTemplateService } from '../../../common/mail/mail-template.service';
import {
    NOTIFICATION_DISPATCH_PORT,
    type NotificationDispatchPort,
} from '../../notification/application/ports/notification-dispatch.port';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import type { AdopterReviewNotifierPort } from '../application/ports/adopter-review-notifier.port';

@Injectable()
export class AdopterReviewNotifierAdapter implements AdopterReviewNotifierPort {
    constructor(
        private readonly breederRepository: BreederRepository,
        @Inject(NOTIFICATION_DISPATCH_PORT)
        private readonly notificationDispatchPort: NotificationDispatchPort,
        private readonly mailTemplateService: MailTemplateService,
    ) {}

    async notifyBreederOfNewReview(breederId: string): Promise<void> {
        const breeder = await this.breederRepository.findById(breederId);
        if (!breeder) {
            return;
        }

        const emailContent = breeder.emailAddress ? this.mailTemplateService.getNewReviewEmail(breeder.name) : null;

        const builder = this.notificationDispatchPort
            .to(breederId, RecipientType.BREEDER)
            .type(NotificationType.NEW_REVIEW_REGISTERED)
            .title('⭐ 새로운 후기가 등록되었어요!')
            .content('브리더 프로필에서 후기를 확인해보세요.')
            .related(`/explore/breeder/${breederId}#reviews`, 'profile')
            .metadata({ breederId });

        if (emailContent && breeder.emailAddress) {
            builder.withEmail({
                to: breeder.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            });
        }

        builder.withPush();

        await builder.send();
    }
}
