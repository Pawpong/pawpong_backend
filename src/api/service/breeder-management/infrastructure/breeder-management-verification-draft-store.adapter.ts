import { Injectable } from '@nestjs/common';

import { RedisService } from '../../../../common/redis/redis.module';

import {
    type BreederManagementVerificationDraftStorePort,
    type BreederManagementVerificationDraftDocument,
} from '../application/ports/breeder-management-verification-draft-store.port';

@Injectable()
export class BreederManagementVerificationDraftStoreAdapter implements BreederManagementVerificationDraftStorePort {
    private static readonly KEY_PREFIX = 'breeder-management:verification-draft:';
    private static readonly TTL_SECONDS = 60 * 60;

    constructor(private readonly redisService: RedisService) {}

    async save(userId: string, documents: BreederManagementVerificationDraftDocument[]): Promise<void> {
        await this.redisService.set(
            this.key(userId),
            JSON.stringify(documents),
            BreederManagementVerificationDraftStoreAdapter.TTL_SECONDS,
        );
    }

    async get(userId: string): Promise<BreederManagementVerificationDraftDocument[]> {
        const serialized = await this.redisService.get(this.key(userId));
        if (!serialized) return [];

        try {
            const value: unknown = JSON.parse(serialized);
            if (!Array.isArray(value)) return [];
            return value.filter((document) => this.isDraftDocument(document));
        } catch {
            return [];
        }
    }

    async delete(userId: string): Promise<void> {
        await this.redisService.del(this.key(userId));
    }

    private key(userId: string): string {
        return `${BreederManagementVerificationDraftStoreAdapter.KEY_PREFIX}${userId}`;
    }

    private isDraftDocument(value: unknown): value is BreederManagementVerificationDraftDocument {
        if (!value || typeof value !== 'object') return false;
        const document = value as Record<string, unknown>;
        return typeof document.type === 'string' && typeof document.fileName === 'string';
    }
}
