import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Connection, createConnection, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { AdopterSchema } from '../../../../schema/adopter.schema';
import { BreederSchema } from '../../../../schema/breeder.schema';
import { PushDeviceSchema } from '../../../../schema/push-device.schema';
import { CommunityPostSchema } from '../../../../schema/community-post.schema';
import { CommunityPostCommentSchema } from '../../../../schema/community-post-comment.schema';
import { VideoSchema } from '../../../../schema/video.schema';
import { VideoLikeSchema } from '../../../../schema/video-like.schema';
import { VideoCommentSchema } from '../../../../schema/video-comment.schema';
import { AccountDeletionRepository } from '../repository/account-deletion.repository';
import { AccountDeletionDraftStore } from '../infrastructure/account-deletion-draft.store';
import { ProcessAccountDeletionUseCase } from '../application/use-cases/process-account-deletion.use-case';
import {
    GetAccountDeletionStatusUseCase,
    RequestAccountDeletionUseCase,
} from '../application/use-cases/request-account-deletion.use-case';
import type { AccountDeletionFiles } from '../application/ports/account-deletion.port';
import { AuthAccountReactivationAdapter } from '../../auth/infrastructure/auth-account-reactivation.adapter';
import { FeedCommentRepository } from '../../feed/comment/repository/feed-comment.repository';
import { FeedCommentMongooseManagerAdapter } from '../../feed/comment/infrastructure/feed-comment-mongoose-manager.adapter';

/** 실서비스 DB/스토리지에는 연결하지 않는다. 독립 ephemeral replica-set과 합성 계정만 사용한다. */
describe('영구 삭제 Mongo 통합', () => {
    jest.setTimeout(60_000);
    let replica: MongoMemoryReplSet;
    let connection: Connection;
    let repo: AccountDeletionRepository;
    let request: RequestAccountDeletionUseCase;
    let worker: ProcessAccountDeletionUseCase;
    let remove: jest.Mock;
    let revoke: jest.Mock;
    const drafts = { get: jest.fn().mockResolvedValue(null), delete: jest.fn().mockResolvedValue(undefined) };
    const collection = (name: string) => connection.db!.collection(name);
    const owner = new Types.ObjectId();
    const other = new Types.ObjectId();
    const photo = 'profile/11111111-1111-4111-8111-111111111111.jpg';

    beforeAll(async () => {
        replica = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ args: ['--quiet'] }] });
        connection = await createConnection(replica.getUri()).asPromise();
        for (const [name, schema] of Object.entries({
            Adopter: AdopterSchema,
            Breeder: BreederSchema,
            PushDevice: PushDeviceSchema,
            CommunityPost: CommunityPostSchema,
            CommunityPostComment: CommunityPostCommentSchema,
            Video: VideoSchema,
            VideoLike: VideoLikeSchema,
            VideoComment: VideoCommentSchema,
        }))
            connection.model(name, schema);
        repo = new AccountDeletionRepository(
            connection,
            drafts as unknown as AccountDeletionDraftStore,
            new EventEmitter2(),
        );
        await repo.onModuleInit();
        request = new RequestAccountDeletionUseCase(repo);
    });
    afterAll(async () => {
        await connection?.close();
        await replica?.stop();
    });
    beforeEach(async () => {
        for (const c of await connection.db!.collections()) await c.deleteMany({});
        jest.clearAllMocks();
        remove = jest.fn().mockResolvedValue(undefined);
        revoke = jest.fn().mockResolvedValue({ status: 'manual_disconnect_required' });
        const files: AccountDeletionFiles = {
            resolveKey: (key) => (key.startsWith('https://foreign.invalid') ? null : key),
            listPrefix: () => Promise.resolve([]),
            delete: remove,
        };
        worker = new ProcessAccountDeletionUseCase(repo, files, { revoke });
        // 실제 User 하위 schema로 cast/default 적용. 잘못된 fcmTokens/authProvider top-level을 테스트가 놓치지 않게 한다.
        await connection.model('Adopter').create({
            _id: owner,
            emailAddress: 'deletion-owner@example.invalid',
            nickname: '합성 소유자',
            accountStatus: 'active',
            userRole: 'adopter',
            refreshToken: 'synthetic-hash',
            pushDeviceTokens: [{ token: 'synthetic-fcm-token', platform: 'ios' }],
            socialAuthInfo: { authProvider: 'apple', providerUserId: 'synthetic-apple-sub' },
            termsAgreed: true,
            privacyAgreed: true,
        });
        await connection.model('Adopter').create({
            _id: other,
            emailAddress: 'deletion-other@example.invalid',
            nickname: '합성 상대방',
            accountStatus: 'active',
            userRole: 'adopter',
            termsAgreed: true,
            privacyAgreed: true,
        });
        await connection
            .model('PushDevice')
            .create({ token: 'synthetic-fcm-token', platform: 'ios', userId: String(owner), userRole: 'adopter' });
        await collection('review_credentials').insertOne({
            accountId: owner,
            role: 'adopter',
            passwordHash: 'synthetic-only',
        });
    });
    const enqueue = () => request.execute(String(owner), 'adopter', 'DELETE_PERMANENTLY');

    it('실제 schema 컬렉션명을 사용하고 접수와 동시에 JWT 대상 상태/refresh/두 푸시 저장소/심사 자격을 잠근다', async () => {
        expect(connection.model('VideoLike').collection.name).toBe('videolikes');
        expect(connection.model('VideoComment').collection.name).toBe('videocomments');
        expect(connection.model('PushDevice').collection.name).toBe('push_device');
        const response = await enqueue();
        const locked = await collection('adopters').findOne({ _id: owner });
        expect(locked).toMatchObject({ accountStatus: 'deleted', pushDeviceTokens: [] });
        expect(locked?.permanentDeletionRequestedAt).toBeInstanceOf(Date);
        expect(locked?.refreshToken).toBeUndefined();
        expect(await collection('push_device').countDocuments({ userId: String(owner) })).toBe(0);
        expect(await collection('review_credentials').countDocuments({ accountId: owner })).toBe(0);
        expect(response.receiptToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(await repo.find(response.requestId)).not.toHaveProperty('receiptToken');
        await expect(enqueue()).rejects.toMatchObject({ status: 409 });
        const publicStatus = await new GetAccountDeletionStatusUseCase(repo).execute(
            response.requestId,
            response.receiptToken,
        );
        expect(Object.keys(publicStatus).sort()).toEqual([
            'appleConnectionRemovalRequired',
            'completedAt',
            'requestId',
            'requestedAt',
            'status',
        ]);
        await expect(
            new GetAccountDeletionStatusUseCase(repo).execute(response.requestId, 'x'.repeat(43)),
        ).rejects.toMatchObject({ status: 404 });
    });

    it('본인 상담·채팅·게시글을 정리하고 상대방 원문/공유 방은 보존, Apple 중첩 식별자를 revoke로 전달한다', async () => {
        const roomId = new Types.ObjectId();
        const postId = new Types.ObjectId();
        const applicationId = new Types.ObjectId();
        await connection.model('CommunityPost').create({
            _id: postId,
            authorId: owner,
            authorModel: 'Adopter',
            authorNickname: '합성 소유자',
            body: '삭제할 본문',
        });
        await connection.model('CommunityPostComment').create({
            postId,
            authorId: other,
            authorModel: 'Adopter',
            authorNickname: '합성 상대방',
            body: '보존할 상대방 댓글',
        });
        await collection('chat_rooms').insertOne({
            _id: roomId,
            participantIds: [String(owner), String(other)],
            participants: [
                { userId: String(owner), role: 'adopter' },
                { userId: String(other), role: 'adopter' },
            ],
            status: 'active',
            lastMessage: '삭제할 본문',
        });
        await collection('chat_messages').insertMany([
            {
                roomId: String(roomId),
                senderId: String(owner),
                content: '삭제할 메시지',
                messageType: 'text',
                createdAt: new Date(1),
            },
            {
                roomId: String(roomId),
                senderId: String(other),
                content: '보존할 상대방 메시지',
                messageType: 'text',
                createdAt: new Date(2),
            },
        ]);
        await collection('adoption_applications').insertOne({
            _id: applicationId,
            adopterId: owner,
            breederId: other,
            adopterName: '합성 이름',
            adopterEmail: 'synthetic@example.invalid',
            adopterPhone: 'synthetic-phone',
            standardResponses: { livingSpaceDescription: '삭제할 상담 응답' },
            customResponses: [],
            breederNotes: '상대방 메모',
        });
        const response = await enqueue();
        expect(await worker.execute(response.requestId)).toBe(true);
        expect(revoke).toHaveBeenCalledWith({
            accountId: String(owner),
            role: 'adopter',
            provider: 'apple',
            providerUserId: 'synthetic-apple-sub',
        });
        expect(await collection('adopters').findOne({ _id: owner })).toBeNull();
        expect(await collection('adopters').findOne({ _id: other })).not.toBeNull();
        expect(await collection('community_posts').findOne({ _id: postId })).toMatchObject({
            body: '[삭제된 게시글]',
            photos: [],
            authorNickname: '삭제된 사용자',
        });
        expect(await collection('community_post_comments').findOne({ authorId: other })).toMatchObject({
            body: '보존할 상대방 댓글',
        });
        expect(await collection('chat_messages').findOne({ senderId: String(owner) })).toMatchObject({
            content: '[삭제된 메시지]',
        });
        expect(await collection('chat_messages').findOne({ senderId: String(other) })).toMatchObject({
            content: '보존할 상대방 메시지',
        });
        expect(await collection('chat_rooms').findOne({ _id: roomId })).toMatchObject({
            status: 'active',
            lastMessage: '보존할 상대방 메시지',
        });
        const application = await collection('adoption_applications').findOne({ _id: applicationId });
        expect(application).toMatchObject({
            adopterName: '삭제된 사용자',
            standardResponses: {},
            customResponses: [],
            breederNotes: '상대방 메모',
        });
        expect(application?.adopterEmail).toBeUndefined();
        expect(application?.adopterPhone).toBeUndefined();
        const done = await repo.find(response.requestId);
        expect(done).toMatchObject({ status: 'completed', appleConnectionRemovalRequired: true });
        expect(done?.plan).toBeUndefined();
        expect(done?.accountId).toBeUndefined();
    });

    it('소유자 기록 없는 파일은 review_required, 원본계정은 삭제하고 파일 승인/성공 전 완료 금지', async () => {
        await collection('adopters').updateOne({ _id: owner }, { $set: { profileImageFileName: photo } });
        const response = await enqueue();
        expect(await worker.execute(response.requestId)).toBe(false);
        expect(remove).not.toHaveBeenCalled();
        expect(await collection('adopters').findOne({ _id: owner })).toBeNull();
        expect(await repo.find(response.requestId)).toMatchObject({ status: 'review_required', dataErased: true });
        await repo.approveFile(response.requestId, photo);
        remove.mockRejectedValueOnce(new Error('synthetic storage failure'));
        expect(await worker.execute(response.requestId)).toBe(false);
        expect(await repo.find(response.requestId)).toMatchObject({ status: 'retryable' });
        expect(await repo.pendingFiles(response.requestId, 10, true)).toEqual([photo]);
        await collection('account_deletion_jobs').updateOne(
            { requestId: response.requestId },
            { $set: { nextAttemptAt: new Date(0) } },
        );
        expect(await worker.execute(response.requestId)).toBe(true);
        expect(remove).toHaveBeenCalledTimes(2);
        expect(revoke).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['breeders', { 'profile.representativePhotos': [photo] }],
        ['breeders', { 'verification.documents': [{ fileName: photo }] }],
        ['available_pets', { breederId: other, parentPetSnapshots: [{ photoFileName: photo }] }],
        ['available_pets', { breederId: other, breedingEnvironment: { photoFileNames: [photo] } }],
        ['parent_pets', { breederId: other, photoFileName: photo }],
        ['breeder_pet_posting_drafts', { breederId: other, form: { parentPetSnapshots: [{ photoFileName: photo }] } }],
    ])('타인 %s 중첩 파일 참조는 운영 승인으로도 삭제 불가', async (name, fields) => {
        await collection('adopters').updateOne({ _id: owner }, { $set: { profileImageFileName: photo } });
        await collection(name).updateOne({ _id: other }, { $set: fields }, { upsert: true });
        const response = await enqueue();
        await worker.execute(response.requestId);
        await expect(repo.approveFile(response.requestId, photo)).rejects.toMatchObject({ status: 409 });
        expect(remove).not.toHaveBeenCalled();
    });

    it('타인 캐시 이미지/즐겨찾기는 본인 파일 manifest로 오인하지 않는다', async () => {
        await collection('adopters').updateOne(
            { _id: owner },
            { $set: { favoriteBreederList: [{ breederProfileImageUrl: photo }] } },
        );
        const response = await enqueue();
        expect(await worker.execute(response.requestId)).toBe(true);
        expect(remove).not.toHaveBeenCalled();
    });

    it('작성자 계정을 실제 제거한 동영상 댓글도 populate null로 조회가 실패하지 않는다', async () => {
        const videoId = new Types.ObjectId();
        const commentId = new Types.ObjectId();
        await connection
            .model('VideoComment')
            .create({ _id: commentId, videoId, userId: owner, userModel: 'Adopter', content: '삭제 대상 부모 댓글' });
        await connection
            .model('VideoComment')
            .create({ videoId, userId: other, userModel: 'Adopter', content: '상대방 답글', parentId: commentId });
        const response = await enqueue();
        await worker.execute(response.requestId);
        const reader = new FeedCommentMongooseManagerAdapter(
            new FeedCommentRepository(connection.model('Video') as never, connection.model('VideoComment') as never),
        );
        await expect(reader.findComment(String(commentId))).resolves.toMatchObject({
            content: '[삭제된 댓글]',
            author: null,
            userId: '',
        });
        await expect(reader.readReplies(String(commentId), 0, 10)).resolves.toEqual([
            expect.objectContaining({ content: '상대방 답글' }),
        ]);
    });

    it('직접 업로드 URL이 살아 있는 source/raw 파일은 운영 승인도 만료까지 거부한다', async () => {
        const key = 'ai-image/source/11111111-1111-4111-8111-111111111111.jpg';
        await collection('adopters').updateOne({ _id: owner }, { $set: { profileImageFileName: key } });
        const response = await enqueue();
        await worker.execute(response.requestId);
        await expect(repo.approveFile(response.requestId, key)).rejects.toMatchObject({ status: 409 });
        expect(remove).not.toHaveBeenCalled();
        await collection('account_deletion_files').updateOne(
            { requestId: response.requestId, objectKey: key },
            { $set: { notBefore: new Date(0) } },
        );
        await repo.approveFile(response.requestId, key);
        expect(await worker.execute(response.requestId)).toBe(true);
    });

    it('Apple revoke 실패 시 DB·파일 삭제를 시작하지 않고 다음 실행에서 재개한다', async () => {
        revoke.mockRejectedValueOnce(new Error('synthetic upstream failure'));
        const response = await enqueue();
        expect(await worker.execute(response.requestId)).toBe(false);
        expect(await collection('adopters').findOne({ _id: owner })).not.toBeNull();
        expect(remove).not.toHaveBeenCalled();
        expect(await repo.find(response.requestId)).toMatchObject({
            status: 'retryable',
            providerCompleted: false,
            dataErased: false,
        });
        await collection('account_deletion_jobs').updateOne(
            { requestId: response.requestId },
            { $set: { nextAttemptAt: new Date(0) } },
        );
        expect(await worker.execute(response.requestId)).toBe(true);
        expect(revoke).toHaveBeenCalledTimes(2);
    });

    it('미디어 작업이 진행 중이면 삭제 완료/원본 지우기를 보류하고 종료 후 예정 출력키를 제거한다', async () => {
        const ai = new Types.ObjectId();
        await collection('ai_image_jobs').insertOne({
            _id: ai,
            userId: String(owner),
            userRole: 'adopter',
            status: 'processing',
            inputObjectKey: '',
        });
        const response = await enqueue();
        expect(await worker.execute(response.requestId)).toBe(false);
        expect(await repo.find(response.requestId)).toMatchObject({ status: 'retryable', dataErased: false });
        expect(await collection('adopters').findOne({ _id: owner })).not.toBeNull();
        await collection('ai_image_jobs').updateOne(
            { _id: ai },
            { $set: { status: 'succeeded', outputObjectKey: `ai-image/result/${String(ai)}.png` } },
        );
        await collection('account_deletion_jobs').updateOne(
            { requestId: response.requestId },
            { $set: { nextAttemptAt: new Date(0) } },
        );
        expect(await worker.execute(response.requestId)).toBe(true);
        expect(remove).toHaveBeenCalledWith(`ai-image/result/${String(ai)}.png`);
    });

    it('동시 worker 한 개만 lease를 얻고, 만료된 worker가 새 worker 상태를 덮지 못한다', async () => {
        const response = await enqueue();
        const [a, b] = await Promise.all([
            repo.claim(response.requestId, 'worker-a'),
            repo.claim(response.requestId, 'worker-b'),
        ]);
        expect([a, b].filter(Boolean)).toHaveLength(1);
        const stale = (a ?? b)!;
        await collection('account_deletion_jobs').updateOne(
            { requestId: response.requestId },
            { $set: { leaseUntil: new Date(0) } },
        );
        const fresh = await repo.claim(response.requestId, 'worker-fresh');
        expect(fresh).not.toBeNull();
        await repo.retry(stale, 'OLD_FAILURE');
        expect(await repo.find(response.requestId)).toMatchObject({ status: 'processing', leaseToken: 'worker-fresh' });
    });

    it('사전 저장한 영수증으로 접수 응답 유실 후 조회하며 같은 UUID로 타인 계정 삭제 불가', async () => {
        const prepared = { requestId: randomUUID(), receiptToken: 'r'.repeat(43) };
        await request.execute(String(owner), 'adopter', 'DELETE_PERMANENTLY', prepared);
        await expect(
            new GetAccountDeletionStatusUseCase(repo).execute(prepared.requestId, prepared.receiptToken),
        ).resolves.toMatchObject({ status: 'pending' });
        await expect(request.execute(String(other), 'adopter', 'DELETE_PERMANENTLY', prepared)).rejects.toMatchObject({
            status: 409,
        });
        expect(await collection('adopters').findOne({ _id: other })).toMatchObject({ accountStatus: 'active' });
        await expect(
            request.execute(String(other), 'adopter', 'DELETE_PERMANENTLY', { requestId: randomUUID() }),
        ).rejects.toMatchObject({ status: 400 });
    });

    it('접수 전 시작된 쓰기가 끝날 때까지 대기하고 마지막 업로드까지 manifest에 포함한다', async () => {
        await collection('account_write_leases').insertOne({
            accountId: String(owner),
            role: 'adopter',
            operation: 'synthetic-upload',
            startedAt: new Date(),
        });
        const response = await enqueue();
        expect(await worker.execute(response.requestId)).toBe(false);
        expect(await repo.find(response.requestId)).toMatchObject({ status: 'retryable', dataErased: false });
        await connection.model('CommunityPost').create({
            authorId: owner,
            authorModel: 'Adopter',
            authorNickname: '합성 소유자',
            body: '뒤늦게 끝난 글',
            photos: [photo],
        });
        await collection('account_write_leases').deleteMany({ accountId: String(owner) });
        await collection('account_deletion_jobs').updateOne(
            { requestId: response.requestId },
            { $set: { nextAttemptAt: new Date(0) } },
        );
        expect(await worker.execute(response.requestId)).toBe(false);
        expect(await repo.find(response.requestId)).toMatchObject({ status: 'review_required', dataErased: true });
        expect(await repo.pendingFiles(response.requestId, 100, true)).toContain(photo);
        expect(await collection('community_posts').findOne({ authorId: owner })).toMatchObject({
            body: '[삭제된 게시글]',
            photos: [],
        });
    });

    it('일반 탈퇴는 복구 가능하고 영구 삭제 접수 계정은 오래된 복구 토큰 경합에도 복구하지 못한다', async () => {
        const adapter = new AuthAccountReactivationAdapter(
            connection.model('Adopter') as never,
            connection.model('Breeder') as never,
        );
        await collection('adopters').updateOne(
            { _id: other },
            { $set: { accountStatus: 'deleted', deletedAt: new Date() } },
        );
        await adapter.reactivate(String(other), 'adopter');
        expect(await collection('adopters').findOne({ _id: other })).toMatchObject({ accountStatus: 'active' });
        await enqueue();
        await expect(adapter.reactivate(String(owner), 'adopter')).rejects.toMatchObject({ statusCode: 401 });
        expect(await collection('adopters').findOne({ _id: owner })).toMatchObject({ accountStatus: 'deleted' });
    });

    it('브리더 삭제는 본인 답변/노트/동물/신고자 캐시만 정리하며 상대방 문의·상담·후기 원문을 보존한다', async () => {
        const breeder = new Types.ObjectId();
        const pet = new Types.ObjectId();
        const inquiry = new Types.ObjectId();
        await connection.model('Breeder').create({
            _id: breeder,
            emailAddress: 'synthetic-breeder@example.invalid',
            nickname: '합성 브리더',
            name: '합성 상호',
            userRole: 'breeder',
            petType: 'dog',
            verification: { status: 'approved', plan: 'basic', documents: [] },
            profile: { specialization: ['dog'] },
            socialAuthInfo: { authProvider: 'google', providerUserId: 'synthetic-google-sub' },
            termsAgreed: true,
            privacyAgreed: true,
        });
        await collection('available_pets').insertMany([
            { _id: pet, breederId: breeder, photos: [] },
            { breederId: other, photos: [] },
        ]);
        await collection('parent_pets').insertOne({ breederId: breeder });
        await collection('breeder_pet_posting_drafts').insertOne({ breederId: breeder, form: {} });
        await collection('inquiries').insertOne({
            _id: inquiry,
            authorId: owner,
            authorNickname: '합성 소유자',
            title: '보존할 질문',
            content: '상대 질문 원문',
            answers: [
                { breederId: breeder, breederName: '합성 브리더', content: '삭제할 답변', imageUrls: [] },
                { breederId: other, breederName: '타 브리더', content: '보존할 답변', imageUrls: [] },
            ],
        });
        await collection('adoption_applications').insertOne({
            breederId: breeder,
            adopterId: owner,
            adopterName: '합성 소유자',
            standardResponses: { selfIntroduction: '상대 원문' },
            breederNotes: '삭제할 메모',
            petId: pet,
            petName: '삭제할 개체명',
        });
        await collection('breeder_reviews').insertOne({
            breederId: breeder,
            adopterId: owner,
            content: '상대 후기 원문',
            replyContent: '삭제할 답글',
        });
        await collection('breeders').insertOne({
            _id: other,
            reports: [
                { reporterId: String(breeder), reporterName: '합성 브리더', description: '본인 신고' },
                { reporterId: String(owner), reporterName: '다른 신고자', description: '상대 원문' },
            ],
        });
        const response = await request.execute(String(breeder), 'breeder', 'DELETE_PERMANENTLY');
        expect(await worker.execute(response.requestId)).toBe(true);
        expect(await collection('breeders').findOne({ _id: breeder })).toBeNull();
        expect(await collection('available_pets').countDocuments({ breederId: other })).toBe(1);
        expect(await collection('available_pets').countDocuments({ breederId: breeder })).toBe(0);
        expect(await collection('parent_pets').countDocuments({ breederId: breeder })).toBe(0);
        expect(await collection('breeder_pet_posting_drafts').countDocuments({ breederId: breeder })).toBe(0);
        const question = await collection('inquiries').findOne({ _id: inquiry });
        expect(question).toMatchObject({
            content: '상대 질문 원문',
            answers: [{ content: '[삭제된 답변]', breederName: '삭제된 사용자' }, { content: '보존할 답변' }],
        });
        const application = await collection('adoption_applications').findOne({ breederId: breeder });
        expect(application).toMatchObject({
            standardResponses: { selfIntroduction: '상대 원문' },
            petName: '삭제된 동물',
        });
        expect(application?.breederNotes).toBeUndefined();
        const review = await collection('breeder_reviews').findOne({ breederId: breeder });
        expect(review?.content).toBe('상대 후기 원문');
        expect(review?.replyContent).toBeUndefined();
        expect((await collection('breeders').findOne({ _id: other }))?.reports).toEqual([
            { reporterId: String(owner), reporterName: '다른 신고자', description: '상대 원문' },
        ]);
        expect(drafts.delete).toHaveBeenCalledWith(String(breeder));
    });
});
