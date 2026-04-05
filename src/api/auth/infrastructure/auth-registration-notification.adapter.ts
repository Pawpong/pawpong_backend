import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import { DiscordWebhookService } from '../../../common/discord/discord-webhook.service';
import {
    type AuthRegistrationDocumentNotificationItem,
    type AuthRegistrationNotificationPort,
} from '../application/ports/auth-registration-notification.port';

@Injectable()
export class AuthRegistrationNotificationAdapter implements AuthRegistrationNotificationPort {
    constructor(
        private readonly discordWebhookService: DiscordWebhookService,
        private readonly storageService: StorageService,
    ) {}

    async notifyAdopterRegistered(input: {
        userId: string;
        email: string;
        nickname: string;
        phone?: string;
        registrationType: 'email' | 'social';
        provider?: string;
    }): Promise<void> {
        await this.discordWebhookService.notifyAdopterRegistration({
            userId: input.userId,
            email: input.email,
            name: input.nickname,
            phone: input.phone,
            nickname: input.nickname,
            registrationType: input.registrationType,
            provider: input.provider,
        });
    }

    async notifyBreederRegistered(input: {
        userId: string;
        email: string;
        name: string;
        phone?: string;
        registrationType: 'email' | 'social';
        provider?: string;
    }): Promise<void> {
        await this.discordWebhookService.notifyBreederRegistration(input);
    }

    async notifyBreederDocumentsSubmitted(input: {
        userId: string;
        email: string;
        name: string;
        documents: AuthRegistrationDocumentNotificationItem[];
    }): Promise<void> {
        await this.discordWebhookService.notifyRegistrationDocuments({
            userId: input.userId,
            email: input.email,
            name: input.name,
            userType: 'breeder',
            documents: input.documents.map((document) => ({
                type: document.type,
                url: this.storageService.generateSignedUrl(document.fileName),
                originalFileName: document.originalFileName,
            })),
        });
    }
}
