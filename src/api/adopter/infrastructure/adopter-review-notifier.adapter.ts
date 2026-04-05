import { Injectable } from '@nestjs/common';

import { RecipientType } from '../../../common/enum/user.enum';
import { MailTemplateService } from '../../../common/mail/mail-template.service';
import { NotificationType } from '../../../schema/notification.schema';
import { NotificationService } from '../../notification/notification.service';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import { AdopterReviewNotifierPort } from '../application/ports/adopter-review-notifier.port';

@Injectable()
export class AdopterReviewNotifierAdapter extends AdopterReviewNotifierPort {
    constructor(
        private readonly breederRepository: BreederRepository,
        private readonly notificationService: NotificationService,
        private readonly mailTemplateService: MailTemplateService,
    ) {
        super();
    }

    async notifyBreederOfNewReview(breederId: string): Promise<void> {
        const breeder = await this.breederRepository.findById(breederId);
        if (!breeder) {
            return;
        }

        const emailContent = breeder.emailAddress ? this.mailTemplateService.getNewReviewEmail(breeder.name) : null;

        const builder = this.notificationService
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

        await builder.send();
    }
}
