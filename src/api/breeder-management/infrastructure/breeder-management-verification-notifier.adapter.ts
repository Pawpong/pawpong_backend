import { Injectable } from '@nestjs/common';

import { DiscordWebhookService } from '../../../common/discord/discord-webhook.service';
import {
    type BreederManagementVerificationNotifierPort,
    type BreederManagementVerificationSubmissionNotification,
} from '../application/ports/breeder-management-verification-notifier.port';

@Injectable()
export class BreederManagementVerificationNotifierAdapter implements BreederManagementVerificationNotifierPort {
    constructor(private readonly discordWebhookService: DiscordWebhookService) {}

    async notifySubmission(payload: BreederManagementVerificationSubmissionNotification): Promise<void> {
        await this.discordWebhookService.notifyBreederVerificationSubmission(payload);
    }
}
