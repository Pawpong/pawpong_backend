import { createHash } from 'node:crypto';
import { Injectable, type OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { ReviewLoginLimitPort } from '../application/review-login.port';

export const REVIEW_LOGIN_LIMIT_SCRIPT = `
local ipCount = redis.call('INCR', KEYS[1])
if ipCount == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local accountCount = redis.call('INCR', KEYS[2])
if accountCount == 1 then redis.call('EXPIRE', KEYS[2], ARGV[1]) end
if ipCount > tonumber(ARGV[2]) or accountCount > tonumber(ARGV[3]) then return 0 end
return 1
`;

/** IP와 계정 각각 공유 제한을 적용하며 Redis 장애 시 메모리 폴백 없이 실패한다. */
@Injectable()
export class ReviewLoginLimitAdapter implements ReviewLoginLimitPort, OnModuleDestroy {
    private readonly client: Redis;
    private connecting?: Promise<void>;

    constructor(config: ConfigService) {
        this.client = new Redis({
            host: config.get<string>('REDIS_HOST') || 'localhost',
            port: Number(config.get<string>('REDIS_PORT') || 6379),
            password: config.get<string>('REDIS_PASSWORD') || undefined,
            db: 0,
            lazyConnect: true,
            enableOfflineQueue: false,
            maxRetriesPerRequest: 0,
            connectTimeout: 1500,
            commandTimeout: 1500,
            retryStrategy: () => null,
        });
        this.client.on('error', () => {});
    }

    /** 최대 15분에 IP 60회/계정 20회. 원문 IP와 이메일은 Redis 키에 저장하지 않는다. */
    async allow(clientIp: string, emailAddress: string): Promise<boolean> {
        const digest = (value: string) => createHash('sha256').update(value).digest('hex');
        try {
            if (this.client.status !== 'ready') {
                this.connecting ??= this.client.connect().finally(() => {
                    this.connecting = undefined;
                });
                await this.connecting;
            }
            const result = await this.client.eval(
                REVIEW_LOGIN_LIMIT_SCRIPT,
                2,
                `auth:review:ip:${digest(
                    clientIp
                        .trim()
                        .toLowerCase()
                        .replace(/^::ffff:/, ''),
                )}`,
                `auth:review:account:${digest(emailAddress.trim().toLowerCase())}`,
                900,
                60,
                20,
            );
            return result === 1;
        } catch {
            throw new ServiceUnavailableException('로그인을 잠시 사용할 수 없습니다. 다시 시도해 주세요.');
        }
    }

    /** 종료 시 전용 Redis 연결을 닫는다. */
    onModuleDestroy() {
        this.client.disconnect();
    }
}
