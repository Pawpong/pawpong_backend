import { Injectable } from '@nestjs/common';

import { AdopterRepository } from '../../adopter/repository/adopter.repository';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import type { NotificationUserRole } from '../application/ports/notification-command.port';
import type {
    NotificationPushTokenStorePort,
    RegisterPushDeviceTokenCommand,
    UnregisterPushDeviceTokenCommand,
    UserPushDeviceTokens,
} from '../application/ports/notification-push-token-store.port';

/**
 * 푸시 토큰 스토어 어댑터.
 *
 * 알림 도메인은 adopter/breeder persistence 경계를 직접 건드리지 않고,
 * 각 도메인의 Repository에 푸시 토큰 CRUD를 위임한다.
 *
 * - adopter: AdopterRepository.{upsert,remove,find}PushDeviceToken(s)
 * - breeder: BreederRepository.{upsert,remove,find}PushDeviceToken(s)
 */
@Injectable()
export class NotificationPushTokenMongooseAdapter implements NotificationPushTokenStorePort {
    constructor(
        private readonly adopterRepository: AdopterRepository,
        private readonly breederRepository: BreederRepository,
    ) {}

    async register(command: RegisterPushDeviceTokenCommand): Promise<void> {
        if (command.userRole === 'adopter') {
            await this.adopterRepository.upsertPushDeviceToken(
                command.userId,
                command.token,
                command.platform,
                command.appVersion,
            );
            return;
        }
        await this.breederRepository.upsertPushDeviceToken(
            command.userId,
            command.token,
            command.platform,
            command.appVersion,
        );
    }

    async unregister(command: UnregisterPushDeviceTokenCommand): Promise<void> {
        if (command.userRole === 'adopter') {
            await this.adopterRepository.removePushDeviceTokens(command.userId, [command.token]);
            return;
        }
        await this.breederRepository.removePushDeviceTokens(command.userId, [command.token]);
    }

    async purgeInvalidTokens(userId: string, userRole: NotificationUserRole, tokens: string[]): Promise<void> {
        if (tokens.length === 0) return;
        if (userRole === 'adopter') {
            await this.adopterRepository.removePushDeviceTokens(userId, tokens);
            return;
        }
        await this.breederRepository.removePushDeviceTokens(userId, tokens);
    }

    async findTokensByUser(userId: string, userRole: NotificationUserRole): Promise<UserPushDeviceTokens> {
        const tokens =
            userRole === 'adopter'
                ? await this.adopterRepository.findPushDeviceTokens(userId)
                : await this.breederRepository.findPushDeviceTokens(userId);

        return { userId, userRole, tokens };
    }
}
