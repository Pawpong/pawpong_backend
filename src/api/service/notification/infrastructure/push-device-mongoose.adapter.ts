import { Injectable } from '@nestjs/common';

import { PushDeviceRepository } from '../repository/push-device.repository';
import type {
    NotificationDeviceRegistryPort,
    RegisterAnonymousDeviceCommand,
    RegisterAnonymousDeviceResult,
} from '../application/ports/notification-device-registry.port';

/**
 * 기기 레지스트리 어댑터 — push_device 컬렉션에 위임한다.
 */
@Injectable()
export class PushDeviceMongooseAdapter implements NotificationDeviceRegistryPort {
    constructor(private readonly pushDeviceRepository: PushDeviceRepository) {}

    async registerDevice(command: RegisterAnonymousDeviceCommand): Promise<RegisterAnonymousDeviceResult> {
        return this.pushDeviceRepository.upsertDevice(command.token, command.platform, command.appVersion);
    }

    async bindToUser(token: string, userId: string, userRole: string): Promise<void> {
        await this.pushDeviceRepository.bindToUser(token, userId, userRole);
    }

    async unbind(token: string): Promise<void> {
        await this.pushDeviceRepository.unbind(token);
    }

    async markWelcomeSent(token: string): Promise<void> {
        await this.pushDeviceRepository.markWelcomeSent(token);
    }

    async removeTokens(tokens: string[]): Promise<void> {
        await this.pushDeviceRepository.removeTokens(tokens);
    }
}
