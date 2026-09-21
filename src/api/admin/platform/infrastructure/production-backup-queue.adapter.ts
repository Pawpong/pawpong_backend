import { Injectable, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import type { ProductionBackupPort } from '../application/ports/production-backup.port';

/** API에는 덤프/스토리지 키를 넘기지 않고, 실행은 별도 단일 워커에 위임한다. */
@Injectable()
export class ProductionBackupQueueAdapter implements ProductionBackupPort, OnModuleDestroy {
    private queue?: Queue;
    constructor(private readonly config: ConfigService) {}
    private enabled() {
        return (
            this.config.get('NODE_ENV') === 'production' &&
            this.config.get('PROD_BACKUP_ENABLED') === 'true' &&
            this.config.get('PAWPONG_TEST_MODE') !== 'true'
        );
    }
    private getQueue() {
        if (!this.enabled()) throw new ServiceUnavailableException('운영 백업이 아직 활성화되지 않았습니다.');
        return (this.queue ??= new Queue('pawpong-prod-backup', {
            connection: {
                host: this.config.get('REDIS_HOST', 'redis'),
                port: Number(this.config.get('REDIS_PORT', 6379)),
                password: this.config.get('REDIS_PASSWORD') || undefined,
                db: 1,
                maxRetriesPerRequest: 1,
                enableOfflineQueue: false,
            },
        }));
    }
    async request(adminId: string) {
        const queue = this.getQueue();
        try {
            if (!(await queue.getWorkersCount())) throw new Error('worker unavailable');
            const job = await queue.add(
                'dump-prod',
                { trigger: 'manual', requestedBy: adminId },
                {
                    deduplication: { id: 'prod-manual' },
                    attempts: 1,
                    removeOnComplete: { count: 1000 },
                    removeOnFail: { count: 1000 },
                },
            );
            return { jobId: job.id! };
        } catch {
            throw new ServiceUnavailableException('백업 워커 연결을 확인한 후 다시 시도하세요.');
        }
    }
    async list() {
        if (!this.enabled()) return { enabled: false, jobs: [] };
        try {
            const jobs = await this.getQueue().getJobs(['active', 'waiting', 'completed', 'failed'], 0, 49, false);
            return {
                enabled: true,
                jobs: await Promise.all(
                    jobs.map(async (job) => ({
                        jobId: job.id,
                        status: await job.getState(),
                        database: 'prod',
                        trigger: job.data.trigger,
                        requestedBy: job.data.requestedBy,
                        createdAt: job.timestamp,
                        startedAt: job.processedOn,
                        finishedAt: job.finishedOn,
                        result: job.returnvalue,
                        errorCode: job.failedReason ? 'BACKUP_FAILED' : undefined,
                    })),
                ),
            };
        } catch {
            throw new ServiceUnavailableException('백업 이력을 조회할 수 없습니다.');
        }
    }
    async onModuleDestroy() {
        await this.queue?.close();
    }
}
