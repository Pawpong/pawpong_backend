import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, createConnection } from 'mongoose';
import { SupportEventRepository } from '../../repository/support-event.repository';
import { SupportEventRecord, SupportEventSchema } from '../../../../../schema/support-event.schema';

describe('지원 알림 DB outbox', () => {
    let mongo: MongoMemoryServer;
    let connection: Connection;
    let repository: SupportEventRepository;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        connection = await createConnection(mongo.getUri()).asPromise();
        const model = connection.model(SupportEventRecord.name, SupportEventSchema);
        await model.init();
        repository = new SupportEventRepository(model);
    });
    afterAll(async () => {
        await connection?.close();
        await mongo?.stop();
    });
    beforeEach(async () => {
        await connection.model<SupportEventRecord>(SupportEventRecord.name).deleteMany({});
    });

    it('두 워커 중 하나만 접수를 가져가며 개발 로그는 운영 전송에서 제외한다', async () => {
        await repository.insert(
            { eventId: 'prod', kind: 'feedback', message: '제보', userType: 'adopter' },
            'production',
        );
        await repository.insert({ eventId: 'dev', kind: 'feedback', userType: 'adopter' }, 'development');
        const claims = await Promise.all([
            repository.claim('production', 'worker-a'),
            repository.claim('production', 'worker-b'),
        ]);
        expect(claims.filter(Boolean)).toHaveLength(1);
        expect(claims.find(Boolean)?.eventId).toBe('prod');
    });

    it('프로세스 종료 후 만료된 임대를 새 워커가 재처리한다', async () => {
        await repository.insert({ eventId: 'retry', kind: 'feedback', userType: 'adopter' }, 'production');
        await repository.claim('production', 'old-worker');
        await connection
            .model<SupportEventRecord>(SupportEventRecord.name)
            .updateOne({ eventId: 'retry' }, { nextAttemptAt: new Date(0) });
        const next = await repository.claim('production', 'new-worker');
        expect(next?.attempts).toBe(2);
        await repository.delivered('retry', 'old-worker');
        expect(
            (await connection.model<SupportEventRecord>(SupportEventRecord.name).findOne({ eventId: 'retry' }))
                ?.deliveryStatus,
        ).toBe('pending');
        await repository.delivered('retry', 'new-worker');
        expect(
            (await connection.model<SupportEventRecord>(SupportEventRecord.name).findOne({ eventId: 'retry' }))
                ?.deliveryStatus,
        ).toBe('delivered');
    });

    it('웹후크 재시도는 접수 원문을 보존하고 즉시 재전송하지 않는다', async () => {
        await repository.insert(
            { eventId: 'backoff', kind: 'feedback', message: '원문 유지', userType: 'breeder' },
            'production',
        );
        await repository.claim('production', 'worker');
        await repository.retry('backoff', 'worker', 1);
        expect(await repository.claim('production', 'other-worker')).toBeNull();
        const record = await connection
            .model<SupportEventRecord>(SupportEventRecord.name)
            .findOne({ eventId: 'backoff' });
        expect(record?.message).toBe('원문 유지');
        expect(record?.deliveryStatus).toBe('pending');
    });
});
