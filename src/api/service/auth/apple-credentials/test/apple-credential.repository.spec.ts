import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { type Connection, type Model } from 'mongoose';
import { AppleCredential, AppleCredentialSchema } from '../../../../../schema/apple-credential.schema';
import { AppleCredentialRepository } from '../repository/apple-credential.repository';

describe('Apple credential repository deletion race', () => {
    let mongo: MongoMemoryServer;
    let connection: Connection;
    let model: Model<AppleCredential>;
    let repository: AppleCredentialRepository;
    let beforeStateLock: (() => Promise<void>) | undefined;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        connection = await mongoose.createConnection(mongo.getUri()).asPromise();
        const schema = AppleCredentialSchema.clone();
        schema.pre('findOneAndUpdate', async function () {
            if (this.getFilter().state === 'available') await beforeStateLock?.();
        });
        model = connection.model<AppleCredential>(AppleCredential.name, schema);
        await model.init();
        repository = new AppleCredentialRepository(model);
    }, 60_000);
    afterAll(async () => {
        await connection?.close();
        await mongo?.stop();
    });
    beforeEach(async () => {
        beforeStateLock = undefined;
        await model.deleteMany({});
    });

    it('기본 조회에 암호문을 반환하지 않는다', async () => {
        await repository.save('first-subject-digest', 'encrypted-token');
        expect((await model.findOne().lean())?.encryptedRefreshToken).toBeUndefined();
    });

    it('삭제 잠금 후 도착한 콜백은 토큰을 다시 저장할 수 없다', async () => {
        await repository.save('first-subject-digest', 'encrypted-token');
        expect((await repository.lockForRevocation('first-subject-digest')).encryptedRefreshToken).toBe(
            'encrypted-token',
        );
        await expect(repository.save('first-subject-digest', 'late-token')).rejects.toThrow('삭제 처리 중');
        await repository.finishRevocation('first-subject-digest', 'revoked');
        const row = await model.findOne().select('+encryptedRefreshToken').lean();
        expect(row?.encryptedRefreshToken).toBeUndefined();
        expect(row?.expiresAt).toBeInstanceOf(Date);
        await expect(repository.save('first-subject-digest', 'late-token')).rejects.toThrow('삭제 처리 중');
    });

    it('타인 토큰을 변경하지 않고 기존 토큰 없는 계정의 수동해제 상태를 재시도에 보존한다', async () => {
        await repository.save('unrelated-subject', 'other-token');
        await repository.lockForRevocation('legacy-subject');
        await repository.finishRevocation('legacy-subject', 'manual_disconnect_required');
        expect((await repository.lockForRevocation('legacy-subject')).revocationStatus).toBe(
            'manual_disconnect_required',
        );
        const unrelated = await model
            .findOne({ subjectDigest: 'unrelated-subject' })
            .select('+encryptedRefreshToken')
            .lean();
        expect(unrelated?.encryptedRefreshToken).toBe('other-token');
        expect(unrelated?.state).toBe('available');
    });

    it('지연된 잠금 요청이 다른 worker의 폐기 완료 상태를 되돌리지 않는다', async () => {
        await repository.save('racing-subject', 'encrypted-token');
        beforeStateLock = () => repository.finishRevocation('racing-subject', 'revoked');
        const result = await repository.lockForRevocation('racing-subject');
        expect(result.state).toBe('revoked');
        expect(result.revocationStatus).toBe('revoked');
        expect(result.encryptedRefreshToken).toBeUndefined();
        expect((await model.findOne({ subjectDigest: 'racing-subject' }).lean())?.state).toBe('revoked');
    });
});
