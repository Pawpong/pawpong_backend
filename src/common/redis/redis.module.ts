import { Module, Global, Logger, Injectable, OnModuleDestroy } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * 직접 ioredis를 사용하는 Redis 서비스
 * cache-manager보다 확실하게 Redis에 저장됨
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor() {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT || '6379', 10);
        const password = process.env.REDIS_PASSWORD;

        this.client = new Redis({
            host,
            port,
            password: password || undefined,
            db: 0,
        });

        this.client.on('connect', () => {
            this.logger.log(`[RedisService] 연결 성공 - ${host}:${port}`);
        });

        this.client.on('error', (err) => {
            this.logger.error(`[RedisService] 연결 에러:`, err.message);
        });
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, value);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    onModuleDestroy() {
        this.client.disconnect();
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
