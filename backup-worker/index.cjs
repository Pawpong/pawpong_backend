'use strict';
const { Queue, Worker } = require('bullmq');
const { configuration, runBackup } = require('./runner.cjs');

async function start() {
    configuration(process.env);
    const connection = { host: process.env.REDIS_HOST || 'redis', port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined, db: 1, maxRetriesPerRequest: null };
    const queue = new Queue('pawpong-prod-backup', { connection });
    await queue.setGlobalConcurrency(1);
    // 운영자 확정/Control 활성화 전에는 자동 실행하지 않는다.
    if (process.env.PROD_BACKUP_SCHEDULE_ENABLED === 'true') {
        await queue.upsertJobScheduler('daily-prod', { pattern: '0 0 3 * * *', tz: 'Asia/Seoul' }, {
            name: 'dump-prod', data: { trigger: 'scheduled', requestedBy: 'scheduler' },
            opts: { attempts: 1, removeOnComplete: { count: 1000 }, removeOnFail: { count: 1000 } },
        });
    } else {
        await queue.removeJobScheduler('daily-prod');
    }
    const worker = new Worker('pawpong-prod-backup', job => runBackup(process.env, job.data), {
        connection, concurrency: 1, maxStalledCount: 0,
    });
    worker.on('failed', job => console.error(JSON.stringify({ event: 'prod_backup_failed', jobId: job?.id })));
    worker.on('completed', job => console.log(JSON.stringify({ event: 'prod_backup_completed', jobId: job.id })));
    worker.on('error', () => console.error('BACKUP_QUEUE_ERROR'));
    for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, async () => {
        await worker.close(); await queue.close();
    });
}
start().catch(() => { console.error('BACKUP_WORKER_CONFIGURATION_FAILED'); process.exitCode = 1; });
