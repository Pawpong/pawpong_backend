import { Injectable } from '@nestjs/common';

import { DiscordWebhookService } from '../../../common/discord/discord-webhook.service';
import {
    BreederManagementVerificationNotifierPort,
    type BreederManagementVerificationSubmissionNotification,
} from '../application/ports/breeder-management-verification-notifier.port';

@Injectable()
export class BreederManagementVerificationNotifierAdapter extends BreederManagementVerificationNotifierPort {
    constructor(private readonly discordWebhookService: DiscordWebhookService) {
        super();
    }

    async notifySubmission(payload: BreederManagementVerificationSubmissionNotification): Promise<void> {
        await this.discordWebhookService.notifyBreederVerificationSubmission(payload);
    }
}
