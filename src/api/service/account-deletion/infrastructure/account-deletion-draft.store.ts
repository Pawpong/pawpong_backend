import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/** 개인정보 삭제에는 기존 RedisService의 silent memory fallback을 사용하지 않는다. */
@Injectable()
export class AccountDeletionDraftStore implements OnModuleDestroy {
    private client?: Redis;
    constructor(private readonly config: ConfigService) {}
    private redis() {
        if (this.client?.status === 'end') this.client = undefined;
        if (!this.client) {
            this.client = new Redis({
                host: this.config.get('REDIS_HOST', 'localhost'),
                port: Number(this.config.get('REDIS_PORT', 6379)),
                password: this.config.get('REDIS_PASSWORD') || undefined,
                db: 0,
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                retryStrategy: () => null,
                connectTimeout: 3000,
                commandTimeout: 5000,
            });
            this.client.on('error', () => {
                /* 오류 원문에 접속 정보가 있을 수 있어 상위 작업 상태로만 보고한다. */
            });
        }
        return this.client;
    }
    async get(accountId: string): Promise<Record<string, unknown> | null> {
        const value = await this.redis().get(`breeder-management:verification-draft:${accountId}`);
        if (!value) return null;
        return { documents: JSON.parse(value) as unknown };
    }
    async delete(accountId: string) {
        await this.redis().del(`breeder-management:verification-draft:${accountId}`);
    }
    onModuleDestroy() {
        this.client?.disconnect();
    }
}
