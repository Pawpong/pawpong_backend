import { Module, Global, Logger, Injectable, OnModuleDestroy } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * 직접 ioredis를 사용하는 Redis 서비스
 * cache-manager보다 확실하게 Redis에 저장됨
 *
 * 로컬 개발 환경에서 Redis 없이도 동작 (인메모리 폴백)
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis | null = null;
    private readonly logger = new Logger(RedisService.name);
    private isConnected = false;
    private connectionAttempted = false;

    // 인메모리 캐시 (Redis 연결 실패 시 폴백)
    private memoryCache = new Map<string, { value: string; expireAt?: number }>();

    constructor() {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT || '6379', 10);
        const password = process.env.REDIS_PASSWORD;

        this.client = new Redis({
            host,
            port,
            password: password || undefined,
            db: 0,
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => {
                // 로컬 개발 환경에서 Redis 없으면 재시도하지 않음
                if (times >= 1 && !this.connectionAttempted) {
                    this.connectionAttempted = true;
                    this.logger.warn(`[RedisService] Redis 연결 실패 - 인메모리 캐시로 폴백합니다 (개발 환경)`);
                    return null; // 재시도 중단
                }
                return null;
            },
            lazyConnect: false,
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            this.logger.log(`[RedisService] 연결 성공 - ${host}:${port}`);
        });

        this.client.on('error', () => {
            // 에러 로그는 retryStrategy에서 한 번만 출력
            this.isConnected = false;
        });

        this.client.on('close', () => {
            this.isConnected = false;
        });
    }

    async get(key: string): Promise<string | null> {
        if (this.isConnected && this.client) {
            try {
                return await this.client.get(key);
            } catch {
                // Redis 에러 시 인메모리 폴백
            }
        }
        // 인메모리 캐시에서 조회
        const cached = this.memoryCache.get(key);
        if (cached) {
            if (cached.expireAt && Date.now() > cached.expireAt) {
                this.memoryCache.delete(key);
                return null;
            }
            return cached.value;
        }
        return null;
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (this.isConnected && this.client) {
            try {
                if (ttlSeconds) {
                    await this.client.setex(key, ttlSeconds, value);
                } else {
                    await this.client.set(key, value);
                }
                return;
            } catch {
                // Redis 에러 시 인메모리 폴백
            }
        }
        // 인메모리 캐시에 저장
        this.memoryCache.set(key, {
            value,
            expireAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
        });
    }

    async del(key: string): Promise<void> {
        if (this.isConnected && this.client) {
            try {
                await this.client.del(key);
                return;
            } catch {
                // Redis 에러 시 인메모리 폴백
            }
        }
        this.memoryCache.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        if (this.isConnected && this.client) {
            try {
                const result = await this.client.exists(key);
                return result === 1;
            } catch {
                // Redis 에러 시 인메모리 폴백
            }
        }
        const cached = this.memoryCache.get(key);
        if (cached) {
            if (cached.expireAt && Date.now() > cached.expireAt) {
                this.memoryCache.delete(key);
                return false;
            }
            return true;
        }
        return false;
    }

    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
        this.memoryCache.clear();
    }
}

/**
 * Redis 및 BullMQ 글로벌 모듈
 * - Redis 캐싱: S3 Signed URL, 동영상 메타데이터 캐싱으로 비용 절감
 * - BullMQ: 동영상 인코딩 작업 큐
 *
 * 환경별 동작:
 * - Docker (production): Redis 컨테이너 연결 (REDIS_HOST=redis)
 * - 로컬 개발: Redis 설치 필요 (brew install redis && brew services start redis)
 */
@Global()
@Module({
    imports: [
        // Redis 캐싱 설정 (cache-manager)
        CacheModule.registerAsync({
            useFactory: async (configService: ConfigService) => {
                const logger = new Logger('RedisModule');
                const host = configService.get('REDIS_HOST', 'localhost');
                const port = configService.get('REDIS_PORT', 6379);
                const password = configService.get('REDIS_PASSWORD');

                try {
                    const store = await redisStore({
                        host,
                        port,
                        password: password || undefined,
                        ttl: 300, // 기본 5분 캐싱
                        db: 0, // 캐싱용 DB
                        lazyConnect: false,
                    });

                    logger.log(`[Redis] 캐시 연결 성공 - ${host}:${port}`);
                    return { store };
                } catch (error) {
                    logger.error(`[Redis] 캐시 연결 실패 - ${host}:${port}:`, error.message);
                    logger.warn('[Redis] 인메모리 캐시로 폴백합니다 (개발 환경)');

                    // 로컬 개발 환경에서 Redis 없이도 동작 (인메모리 캐시)
                    return {
                        ttl: 300,
                    };
                }
            },
            inject: [ConfigService],
            isGlobal: true,
        }),

        // BullMQ 설정
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                const logger = new Logger('RedisModule');
                const host = configService.get('REDIS_HOST', 'localhost');
                const port = configService.get('REDIS_PORT', 6379);
                const password = configService.get('REDIS_PASSWORD');

                logger.log(`[BullMQ] Redis 연결 설정 - ${host}:${port}`);

                return {
                    connection: {
                        host,
                        port,
                        password: password || undefined,
                        db: 1, // BullMQ용 별도 DB
                        maxRetriesPerRequest: null, // BullMQ 필수 설정
                        enableReadyCheck: false,
                    },
                    defaultJobOptions: {
                        attempts: 3, // 최대 3번 재시도
                        backoff: {
                            type: 'exponential',
                            delay: 5000, // 5초 대기 후 재시도
                        },
                        removeOnComplete: 100, // 완료된 작업 최근 100개만 유지
                        removeOnFail: 1000, // 실패한 작업 최근 1000개만 유지
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [RedisService],
    exports: [CacheModule, BullModule, RedisService],
})
export class RedisModule {}
