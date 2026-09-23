import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PushDeviceRepository } from '../repository/push-device.repository';

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
        @InjectConnection() private readonly connection: Connection,
        private readonly deviceRepository: PushDeviceRepository,
    ) {}

    async register(command: RegisterPushDeviceTokenCommand): Promise<void> {
        // 기기 문서를 먼저 잠그고 계정 간 이동을 한 트랜잭션에 묶는다.
        // 동시에 두 계정이 등록해도 write conflict 재시도 후 소유자는 하나만 남는다.
        const transfer = () =>
            this.connection.transaction(async (session) => {
                await this.deviceRepository.bindToUser(command.token, command.userId, command.userRole, session);
                // 동일 트랜잭션의 병렬 작업은 MongoDB가 지원하지 않으므로 순서대로 처리한다.
                await this.adopterRepository.removePushDeviceTokenFromAllUsers(command.token, session);
                await this.breederRepository.removePushDeviceTokenFromAllUsers(command.token, session);
                const repository = command.userRole === 'adopter' ? this.adopterRepository : this.breederRepository;
                await repository.upsertPushDeviceToken(
                    command.userId,
                    command.token,
                    command.platform,
                    command.appVersion,
                    session,
                );
            });
        try {
            await transfer();
        } catch (error) {
            // 최초 등록끼리 경합하여 unique upsert가 실패하면, 생성된 문서를 대상으로 한 번 재시도한다.
            if ((error as { code?: number })?.code !== 11000) throw error;
            await transfer();
        }
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
        await this.deviceRepository.removeTokens(tokens);
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
