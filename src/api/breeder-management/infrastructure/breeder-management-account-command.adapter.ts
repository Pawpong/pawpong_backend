import { Injectable } from '@nestjs/common';

import { ApplicationStatus } from '../../../common/enum/user.enum';
import { DiscordWebhookService } from '../../../common/discord/discord-webhook.service';
import type {
    BreederManagementAccountCommandPort,
    BreederManagementAccountRecord,
    BreederManagementDeleteAccountCommand,
} from '../application/ports/breeder-management-account-command.port';
import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';
import { AvailablePetManagementRepository } from '../repository/available-pet-management.repository';
import { BreederRepository } from '../repository/breeder.repository';

@Injectable()
export class BreederManagementAccountCommandAdapter implements BreederManagementAccountCommandPort {
    constructor(
        private readonly breederRepository: BreederRepository,
        private readonly adoptionApplicationRepository: AdoptionApplicationRepository,
        private readonly availablePetManagementRepository: AvailablePetManagementRepository,
        private readonly discordWebhookService: DiscordWebhookService,
    ) {}

    findBreederById(userId: string): Promise<BreederManagementAccountRecord | null> {
        return this.breederRepository.findById(userId) as Promise<BreederManagementAccountRecord | null>;
    }

    countPendingApplications(userId: string): Promise<number> {
        return this.adoptionApplicationRepository.countByStatus(userId, ApplicationStatus.CONSULTATION_PENDING);
    }

    async softDeleteBreeder(command: BreederManagementDeleteAccountCommand): Promise<void> {
        await this.breederRepository.updateProfile(command.userId, {
            accountStatus: 'deleted',
            deletedAt: command.deletedAt,
            deleteReason: command.reason || null,
            deleteReasonDetail: command.otherReason || null,
            updatedAt: command.deletedAt,
        });
    }

    deactivateAllAvailablePetsByBreeder(userId: string): Promise<number> {
        return this.availablePetManagementRepository.deactivateAllByBreeder(userId);
    }

    notifyBreederWithdrawal(
        command: BreederManagementDeleteAccountCommand,
        breeder: BreederManagementAccountRecord,
    ): Promise<void> {
        return this.discordWebhookService.notifyUserWithdrawal({
            userId: command.userId,
            userType: 'breeder',
            email: breeder.emailAddress,
            name: breeder.name || breeder.nickname || '알 수 없음',
            nickname: breeder.nickname,
            reason: command.reason || 'unknown',
            reasonDetail: command.otherReason || undefined,
            deletedAt: command.deletedAt,
        });
    }
}
