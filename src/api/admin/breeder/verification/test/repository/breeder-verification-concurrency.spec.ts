import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, createConnection, Model, Schema } from 'mongoose';
import { BreederVerificationAdminRepository } from '../../repository/breeder-verification-admin.repository';

/** 운영 연결/발송 없이 실제 Mongo의 조건부 갱신과 목록 필터를 검증한다. */
describe('심사 저장소 동시 처리와 계정 구분', () => {
    let mongo: MongoMemoryServer;
    let connection: Connection;
    let model: Model<any>;
    let repository: BreederVerificationAdminRepository;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        connection = await createConnection(mongo.getUri()).asPromise();
        model = connection.model('VerificationTestBreeder', new Schema({}, { strict: false }));
        repository = new BreederVerificationAdminRepository({} as any, model as any);
    }, 60000);

    afterAll(async () => {
        await connection?.close();
        await mongo?.stop();
    });

    beforeEach(async () => {
        await model.deleteMany({});
    });

    it('동시에 승인/반려하면 하나의 요청만 성공한다', async () => {
        const breeder = await model.create({ verification: { status: 'reviewing' } });
        const results = await Promise.all(
            ['approved', 'rejected'].map((verificationStatus) =>
                repository.updateBreederVerification(String(breeder._id), {
                    expectedStatus: 'reviewing',
                    verificationStatus,
                    reviewedAt: new Date(),
                }),
            ),
        );
        expect(results.filter(Boolean)).toHaveLength(1);
        expect(results.filter((result) => !result)).toHaveLength(1);
    });

    it.each(['getBreeders', 'getPendingBreeders'] as const)(
        '%s에서 계정 필터와 total을 함께 적용한다',
        async (method) => {
            await model.create([
                { verification: { status: 'pending' }, isTestAccount: true },
                { verification: { status: 'pending' }, isTestAccount: false },
                { verification: { status: 'pending' } },
            ]);
            const base = { pageNumber: 1, itemsPerPage: 10 };
            expect((await repository[method]({ ...base, accountType: 'test' })).total).toBe(1);
            const normal = await repository[method]({ ...base, accountType: 'normal' });
            expect(normal.total).toBe(2);
            expect(normal.items.every((item) => item.isTestAccount !== true)).toBe(true);
            expect((await repository[method]({ ...base, accountType: 'all' })).total).toBe(3);
            expect((await repository[method](base)).total).toBe(3);
        },
    );
});
