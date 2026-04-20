import { Injectable } from '@nestjs/common';

import { DiscordWebhookService } from '../../../common/discord/discord-webhook.service';
import { AdopterRepository } from '../repository/adopter.repository';
import type { AdopterAccountRecord, AdopterDeleteAccountCommand } from '../application/ports/adopter-account-command.port';
import type { AdopterAccountCommandPort } from '../application/ports/adopter-account-command.port';

@Injectable()
export class AdopterAccountCommandAdapter implements AdopterAccountCommandPort {
    constructor(
        private readonly adopterRepository: AdopterRepository,
        private readonly discordWebhookService: DiscordWebhookService,
    ) {}

    findAdopterById(userId: string): Promise<AdopterAccountRecord | null> {
        return this.adopterRepository.findById(userId) as Promise<AdopterAccountRecord | null>;
    }

    async softDeleteAdopter(command: AdopterDeleteAccountCommand): Promise<void> {
        await this.adopterRepository.updateProfile(command.userId, {
            accountStatus: 'deleted',
            deletedAt: command.deletedAt,
            deleteReason: command.reason,
            deleteReasonDetail: command.otherReason || null,
            updatedAt: command.deletedAt,
        });
    }

    notifyAdopterWithdrawal(command: AdopterDeleteAccountCommand, adopter: AdopterAccountRecord): Promise<void> {
        return this.discordWebhookService.notifyUserWithdrawal({
            userId: command.userId,
            userType: 'adopter',
            email: adopter.emailAddress,
            name: adopter.nickname || '알 수 없음',
            nickname: adopter.nickname,
            reason: command.reason,
            reasonDetail: command.otherReason || undefined,
            deletedAt: command.deletedAt,
        });
    }
}
