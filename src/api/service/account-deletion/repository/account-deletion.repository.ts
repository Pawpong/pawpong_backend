import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { ClientSession, Document } from 'mongodb';
import type {
    AccountDeletionStore,
    DeletionAccount,
    DeletionJob,
    DeletionPlan,
    DeletionRole,
} from '../application/ports/account-deletion.port';
import { buildAccountDeletionPlan, type DeletionRows } from '../domain/account-deletion-plan';
import { AccountDeletionDraftStore } from '../infrastructure/account-deletion-draft.store';

const LEASE_MS = 5 * 60_000;
const JOBS = 'account_deletion_jobs';
const FILES = 'account_deletion_files';
const accountCollection = (role: DeletionRole) => (role === 'adopter' ? 'adopters' : 'breeders');

/** Mongo 트랜잭션은 계정 잠금/접수, 삭제 계획/manifest, DB 정리/단계 완료를 각각 원자적으로 묶는다. */
@Injectable()
export class AccountDeletionRepository implements AccountDeletionStore, OnModuleInit {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly drafts: AccountDeletionDraftStore,
        private readonly events: EventEmitter2,
    ) {}

    private collection(name: string) {
        return this.connection.db!.collection(name);
    }
    async onModuleInit() {
        await this.collection(JOBS).createIndex({ requestId: 1 }, { unique: true });
        await this.collection(JOBS).createIndex(
            { accountId: 1, role: 1 },
            { unique: true, partialFilterExpression: { accountId: { $type: 'string' } } },
        );
        await this.collection(JOBS).createIndex({ status: 1, nextAttemptAt: 1, leaseUntil: 1 });
        await this.collection(FILES).createIndex({ requestId: 1, objectKey: 1 }, { unique: true });
    }

    async request(accountId: string, role: DeletionRole, requestId: string, receiptHash: string): Promise<DeletionJob> {
        if (!Types.ObjectId.isValid(accountId)) throw new NotFoundException('계정을 찾을 수 없습니다.');
        const now = new Date();
        const job: DeletionJob = {
            requestId,
            receiptHash,
            accountId,
            role,
            status: 'pending',
            requestedAt: now,
            appleConnectionRemovalRequired: false,
            providerCompleted: false,
            dataErased: false,
            attempts: 0,
        };
        try {
            await this.transaction(async (session) => {
                if (await this.collection(JOBS).findOne({ accountId, role }, { session }))
                    throw new ConflictException('이미 영구 삭제를 접수한 계정입니다.');
                const result = await this.collection(accountCollection(role)).updateOne(
                    {
                        _id: new Types.ObjectId(accountId),
                        accountStatus: 'active',
                        permanentDeletionRequestedAt: { $exists: false },
                    },
                    {
                        $set: {
                            accountStatus: 'deleted',
                            deletedAt: now,
                            permanentDeletionRequestedAt: now,
                            pushDeviceTokens: [],
                            updatedAt: now,
                        },
                        $unset: { refreshToken: '' },
                    },
                    { session },
                );
                if (result.matchedCount !== 1) throw new ConflictException('영구 삭제를 접수할 수 없는 계정입니다.');
                await this.collection('push_device').deleteMany({ userId: accountId, userRole: role }, { session });
                await this.collection('review_credentials').deleteMany(
                    { accountId: new Types.ObjectId(accountId), role },
                    { session },
                );
                await this.collection(JOBS).insertOne({ ...job, nextAttemptAt: now }, { session });
            });
        } catch (error) {
            if ((error as { code?: number }).code === 11000)
                throw new ConflictException('이미 접수한 삭제 요청입니다.');
            throw error;
        }
        this.events.emit('account.permanent-deletion.requested', { accountId, role });
        return job;
    }

    async find(requestId: string) {
        return (await this.collection(JOBS).findOne({ requestId })) as unknown as DeletionJob | null;
    }
    private eligible(now = new Date()) {
        return {
            status: { $in: ['pending', 'retryable', 'processing'] },
            nextAttemptAt: { $lte: now },
            $or: [{ leaseUntil: { $exists: false } }, { leaseUntil: { $lte: now } }],
        };
    }
    async claim(requestId: string, leaseToken: string): Promise<DeletionJob | null> {
        return (await this.collection(JOBS).findOneAndUpdate(
            { requestId, ...this.eligible() },
            {
                $set: { status: 'processing', leaseToken, leaseUntil: new Date(Date.now() + LEASE_MS) },
                $inc: { attempts: 1 },
            },
            { returnDocument: 'after' },
        )) as unknown as DeletionJob | null;
    }
    async dueRequestIds(limit: number) {
        return (
            await this.collection(JOBS)
                .find(this.eligible(), { projection: { requestId: 1 } })
                .sort({ nextAttemptAt: 1 })
                .limit(Math.min(limit, 5))
                .toArray()
        ).map((r) => r.requestId as string);
    }
    private lease(job: DeletionJob) {
        return {
            requestId: job.requestId,
            leaseToken: job.leaseToken,
            status: 'processing',
            leaseUntil: { $gt: new Date() },
        };
    }
    async heartbeat(requestId: string, leaseToken: string) {
        const result = await this.collection(JOBS).updateOne(
            { requestId, leaseToken, status: 'processing', leaseUntil: { $gt: new Date() } },
            { $set: { leaseUntil: new Date(Date.now() + LEASE_MS) } },
        );
        return result.matchedCount === 1;
    }

    async collect(job: DeletionJob): Promise<DeletionPlan> {
        const accountId = job.accountId!;
        const role = job.role!;
        const id = new Types.ObjectId(accountId);
        const model = role === 'adopter' ? 'Adopter' : 'Breeder';
        await this.assertNoWrites({ accountId, role });
        const account = await this.collection(accountCollection(role)).findOne({
            _id: id,
            permanentDeletionRequestedAt: { $exists: true },
        });
        if (!account) throw new Error('LOCKED_ACCOUNT_REQUIRED');
        const rows: DeletionRows = { account: [account] };
        const selectors: Record<string, [string, Document]> = {
            community_post_owned: ['community_posts', { authorId: id, authorModel: model }],
            community_comments: ['community_post_comments', { authorId: id, authorModel: model }],
            video_owned: ['videos', { uploadedBy: id, uploaderModel: model }],
            contest_entry_owned: ['contest_entries', { userId: accountId }],
            ai_image_jobs: ['ai_image_jobs', { userId: accountId, userRole: role }],
            chat_messages: ['chat_messages', { senderId: accountId }],
            inquiries: ['inquiries', role === 'adopter' ? { authorId: id } : { 'answers.breederId': id }],
            adoption_applications: [
                'adoption_applications',
                role === 'adopter' ? { adopterId: id } : { breederId: id },
            ],
            breeder_reviews: ['breeder_reviews', role === 'adopter' ? { adopterId: id } : { breederId: id }],
            favorites: ['favorites', role === 'adopter' ? { adopterId: id } : { breederId: id }],
            community_post_likes: ['community_post_likes', { userId: id, userModel: model }],
            community_bookmarks: ['community_bookmarks', { userId: accountId, userModel: model }],
            video_likes: ['videolikes', { userId: id, userModel: model }],
            contest_votes: ['contest_votes', { voterId: accountId }],
            user_follows: ['user_follows', { $or: [{ followerId: accountId }, { followeeId: accountId }] }],
            adopter_pet_favorites: ['adopter_pet_favorites', { adopterId: id }],
            community_reports: ['community_post_reports', { reporterId: id, reporterModel: model }],
        };
        selectors.breeder_reports = ['breeder_reports', { reporterId: id }];
        if (role === 'breeder')
            for (const name of ['available_pets', 'parent_pets', 'breeder_pet_posting_drafts'])
                selectors[name] = [name, { breederId: id }];
        await Promise.all(
            Object.entries(selectors).map(async ([name, [collection, query]]) => {
                rows[name] = await this.collection(collection).find(query).toArray();
            }),
        );
        // 작업 중인 외부 생성기가 파일을 재생성할 수 있으므로 종료 확인 전에는 manifest를 확정하지 않는다.
        if (
            rows.ai_image_jobs.some((row) => !['succeeded', 'failed'].includes(row.status ?? '')) ||
            rows.video_owned.some((row) => row.status === 'processing')
        )
            throw new Error('MEDIA_WORK_IN_PROGRESS');
        if (role === 'breeder') {
            const draft = await this.drafts.get(accountId);
            rows.verification_draft = draft ? [draft] : [];
        }
        return buildAccountDeletionPlan(
            {
                accountId,
                role,
                provider: (account.socialAuthInfo as { authProvider?: string } | undefined)?.authProvider,
                providerUserId: (account.socialAuthInfo as { providerUserId?: string } | undefined)?.providerUserId,
            },
            rows,
        );
    }

    async savePlan(job: DeletionJob, plan: DeletionPlan, objectKeys: string[]) {
        await this.transaction(async (session) => {
            await this.assertLease(job, session);
            for (const objectKey of objectKeys) {
                const generated =
                    plan.prefixes.some((prefix) => objectKey.startsWith(prefix)) ||
                    this.isGeneratedFile(plan, objectKey);
                const presignedInput = objectKey.startsWith('ai-image/source/') || objectKey.startsWith('videos/raw/');
                await this.collection(FILES).updateOne(
                    { requestId: job.requestId, objectKey },
                    {
                        $setOnInsert: {
                            deleted: false,
                            approvalRequired: !generated,
                            ...(presignedInput ? { notBefore: new Date(Date.now() + 600_000) } : {}),
                        },
                    },
                    { upsert: true, session },
                );
            }
            await this.collection(JOBS).updateOne(this.lease(job), { $set: { plan } }, { session });
        });
    }
    private isGeneratedFile(plan: DeletionPlan, key: string) {
        return plan.generatedKeys.includes(key);
    }
    async providerDone(job: DeletionJob, manual: boolean) {
        await this.collection(JOBS).updateOne(this.lease(job), {
            $set: { providerCompleted: true, appleConnectionRemovalRequired: manual },
        });
    }

    async eraseData(job: DeletionJob) {
        const plan = job.plan!;
        // Redis 삭제 실패도 재시도한다. silent memory fallback은 개인정보 삭제 성공 증거로 쓰지 않는다.
        if (plan.account.role === 'breeder') await this.drafts.delete(plan.account.accountId);
        await this.transaction(async (session) => {
            await this.assertLease(job, session);
            await this.assertNoWrites(plan.account, session);
            for (const operation of plan.operations) {
                if (operation.update)
                    await this.collection(operation.collection).updateMany(operation.filter, operation.update, {
                        session,
                        ...(operation.arrayFilters ? { arrayFilters: operation.arrayFilters } : {}),
                    });
                else await this.collection(operation.collection).deleteMany(operation.filter, { session });
            }
            await this.recount(plan, session);
            await this.collection(accountCollection(plan.account.role)).deleteOne(
                { _id: new Types.ObjectId(plan.account.accountId), permanentDeletionRequestedAt: { $exists: true } },
                { session },
            );
            // DB 정리가 끝나면 복제된 삭제 쿼리/본문/소셜 식별자는 보존하지 않는다.
            await this.collection(JOBS).updateOne(
                this.lease(job),
                {
                    $set: { dataErased: true },
                    $unset: {
                        'plan.account.provider': '',
                        'plan.account.providerUserId': '',
                        'plan.operations': '',
                        'plan.fileCandidates': '',
                        'plan.generatedKeys': '',
                        'plan.prefixes': '',
                        'plan.affectedBreeders': '',
                        'plan.affectedPosts': '',
                        'plan.affectedVideos': '',
                        'plan.affectedEntries': '',
                        'plan.affectedContests': '',
                        'plan.affectedUsers': '',
                        'plan.affectedPets': '',
                    },
                },
                { session },
            );
        });
    }
    private async recount(plan: DeletionPlan, session: ClientSession) {
        const count = (collection: string, filter: Document) =>
            this.collection(collection).countDocuments(filter, { session });
        const update = (collection: string, id: string, fields: Document) =>
            this.collection(collection).updateOne({ _id: new Types.ObjectId(id) }, { $set: fields }, { session });
        for (const id of plan.affectedBreeders) {
            await update('breeders', id, {
                'stats.totalFavorites': await count('favorites', { breederId: new Types.ObjectId(id) }),
                'stats.totalReviews': await count('breeder_reviews', {
                    breederId: new Types.ObjectId(id),
                    isVisible: true,
                }),
            });
        }
        for (const id of plan.affectedPosts)
            await update('community_posts', id, {
                likeCount: await count('community_post_likes', { postId: new Types.ObjectId(id) }),
                saveCount: await count('community_bookmarks', { postId: new Types.ObjectId(id) }),
            });
        for (const id of plan.affectedVideos)
            await update('videos', id, { likeCount: await count('videolikes', { videoId: new Types.ObjectId(id) }) });
        for (const id of plan.affectedPets)
            await update('available_pets', id, {
                favoriteCount: await count('adopter_pet_favorites', { petId: new Types.ObjectId(id) }),
            });
        for (const id of plan.affectedEntries)
            await update('contest_entries', id, {
                voteCount: await count('contest_votes', { entryId: new Types.ObjectId(id) }),
            });
        for (const id of plan.affectedContests)
            await update('contests', id, {
                participantCount: await count('contest_entries', { contestId: new Types.ObjectId(id) }),
            });
        for (const id of plan.affectedUsers)
            for (const collection of ['adopters', 'breeders'])
                await update(collection, id, {
                    [collection === 'breeders' ? 'stats.followerCount' : 'followerCount']: await count('user_follows', {
                        followeeId: id,
                    }),
                    [collection === 'breeders' ? 'stats.followingCount' : 'followingCount']: await count(
                        'user_follows',
                        { followerId: id },
                    ),
                });
        // 상대방 최신 메시지는 내용 그대로, 본인 메시지는 삭제 표시로 미리보기를 맞춘다.
        const rooms = await this.collection('chat_rooms')
            .find(
                {
                    $or: [
                        { participantIds: plan.account.accountId },
                        { adopterId: plan.account.accountId },
                        { breederId: plan.account.accountId },
                    ],
                },
                { session },
            )
            .toArray();
        for (const room of rooms) {
            const last = await this.collection('chat_messages')
                .find({ roomId: String(room._id) }, { session })
                .sort({ createdAt: -1, _id: -1 })
                .limit(1)
                .next();
            if (last)
                await this.collection('chat_rooms').updateOne(
                    { _id: room._id },
                    { $set: { lastMessage: last.content, lastMessageAt: last.createdAt } },
                    { session },
                );
        }
    }

    async pendingFiles(requestId: string, limit: number, includeReview = false) {
        return (
            await this.collection(FILES)
                .find({
                    requestId,
                    deleted: false,
                    ...(includeReview
                        ? {}
                        : {
                              approvalRequired: false,
                              $or: [{ notBefore: { $exists: false } }, { notBefore: { $lte: new Date() } }],
                          }),
                })
                .limit(limit)
                .toArray()
        ).map((file) => file.objectKey as string);
    }
    async fileDeleted(requestId: string, objectKey: string) {
        await this.collection(FILES).updateOne({ requestId, objectKey }, { $set: { deleted: true } });
    }
    async requireFileReview(job: DeletionJob, objectKey: string) {
        await this.collection(FILES).updateOne(
            { requestId: job.requestId, objectKey },
            { $set: { approvalRequired: true }, $unset: { approvedAt: '' } },
        );
    }
    async reviewRequired(job: DeletionJob) {
        await this.collection(JOBS).updateOne(this.lease(job), {
            $set: { status: 'review_required' },
            $unset: { leaseToken: '', leaseUntil: '' },
        });
    }
    async complete(job: DeletionJob) {
        await this.transaction(async (session) => {
            await this.assertLease(job, session);
            await this.assertNoWrites(job.plan!.account, session);
            if (await this.collection(FILES).findOne({ requestId: job.requestId, deleted: false }, { session }))
                throw new Error('FILES_PENDING');
            const result = await this.collection(JOBS).updateOne(
                { ...this.lease(job), dataErased: true, providerCompleted: true },
                {
                    $set: { status: 'completed', completedAt: new Date() },
                    $unset: {
                        accountId: '',
                        role: '',
                        plan: '',
                        leaseToken: '',
                        leaseUntil: '',
                        nextAttemptAt: '',
                        lastErrorCode: '',
                    },
                },
                { session },
            );
            if (result.matchedCount !== 1) throw new Error('STAGES_PENDING');
            await this.collection(FILES).deleteMany({ requestId: job.requestId }, { session });
        });
    }
    async retry(job: DeletionJob, code: string) {
        await this.collection(JOBS).updateOne(this.lease(job), {
            $set: {
                status: 'retryable',
                lastErrorCode: code,
                nextAttemptAt: new Date(Date.now() + Math.min(30 * 60_000, 30_000 * Math.max(1, job.attempts))),
            },
            $unset: { leaseToken: '', leaseUntil: '' },
        });
    }
    private async assertLease(job: DeletionJob, session: ClientSession) {
        if (!(await this.collection(JOBS).findOne(this.lease(job), { session }))) throw new Error('LEASE_LOST');
    }
    private async assertNoWrites(account: DeletionAccount, session?: ClientSession) {
        if (
            await this.collection('account_write_leases').findOne(
                { accountId: account.accountId, role: account.role },
                { session },
            )
        )
            throw new Error('ACCOUNT_WRITES_PENDING');
    }
    private async transaction<T>(callback: (session: ClientSession) => Promise<T>) {
        const session = await this.connection.startSession();
        try {
            return await session.withTransaction(() => callback(session));
        } finally {
            await session.endSession();
        }
    }

    /** 사용자 입력에 타인의 URL을 복사해 놓아도 타인 참조 파일은 자동/승인 삭제 모두 차단한다. */
    async hasOtherFileReference(account: DeletionAccount, objectKey: string): Promise<boolean> {
        const id = new Types.ObjectId(account.accountId);
        const regex = new RegExp(`(?:^|/)${objectKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[?"\\s]|$)`);
        const specifications: Array<[string, Document, string[]]> = [
            ['adopters', { _id: { $ne: id } }, ['profileImageFileName']],
            [
                'breeders',
                { _id: { $ne: id } },
                [
                    'profileImageFileName',
                    'profile.representativePhotos',
                    'verification.documents.fileName',
                    'verification.levelChangeRequest.documents.fileName',
                ],
            ],
            ['community_posts', { authorId: { $ne: id } }, ['photos', 'authorProfileImageFileName']],
            ['community_post_comments', { authorId: { $ne: id } }, ['authorProfileImageFileName']],
            [
                'available_pets',
                { breederId: { $ne: id } },
                [
                    'photos',
                    'healthRecords',
                    'parentPetSnapshots.photoFileName',
                    'breedingEnvironment.photoFileName',
                    'breedingEnvironment.photoFileNames',
                ],
            ],
            ['parent_pets', { breederId: { $ne: id } }, ['photos', 'photoFileName', 'healthRecords']],
            [
                'breeder_pet_posting_drafts',
                { breederId: { $ne: id } },
                [
                    'form.photos',
                    'form.healthRecords',
                    'form.parentPetSnapshots.photoFileName',
                    'form.breedingEnvironment.photoFileNames',
                ],
            ],
            ['videos', { uploadedBy: { $ne: id } }, ['originalKey', 'thumbnailKey', 'hlsManifestKey']],
            ['ai_image_jobs', { userId: { $ne: account.accountId } }, ['inputObjectKey', 'outputObjectKey']],
            ['contest_entries', { userId: { $ne: account.accountId } }, ['photoFileName', 'userProfileImageFileName']],
            ['chat_messages', { senderId: { $ne: account.accountId } }, ['content']],
            ['inquiries', { authorId: { $ne: id } }, ['imageUrls']],
            ['inquiries', {}, ['answers.imageUrls']],
            ['adoption_applications', { adopterId: { $ne: id } }, ['customResponses.answer']],
        ];
        for (const [collection, owner, fields] of specifications) {
            if (
                await this.collection(collection).findOne(
                    { ...owner, $or: fields.map((field) => ({ [field]: regex })) },
                    { projection: { _id: 1 } },
                )
            )
                return true;
        }
        return false;
    }

    /** 운영 명령도 한 작업/한 파일만 승인한다. 타계정 참조는 승인으로 우회할 수 없다. */
    async approveFile(requestId: string, objectKey: string) {
        const job = await this.find(requestId);
        if (!job?.plan || job.status !== 'review_required')
            throw new ConflictException('운영 검토 대기 작업이 아닙니다.');
        const file = await this.collection(FILES).findOne({
            requestId,
            objectKey,
            approvalRequired: true,
            deleted: false,
        });
        if (file?.notBefore && file.notBefore > new Date())
            throw new ConflictException('기존 직접 업로드 URL의 만료를 기다려야 합니다.');
        if (await this.hasOtherFileReference(job.plan.account, objectKey))
            throw new ConflictException(
                '다른 사용자의 참조 파일은 승인으로 삭제할 수 없습니다. 별도 소유권 조정이 필요합니다.',
            );
        const result = await this.collection(FILES).updateOne(
            { requestId, objectKey, approvalRequired: true, deleted: false },
            { $set: { approvalRequired: false, approvedAt: new Date() } },
        );
        if (result.matchedCount !== 1) throw new NotFoundException('검토 대상 파일이 아닙니다.');
        await this.collection(JOBS).updateOne(
            { requestId, status: 'review_required' },
            { $set: { status: 'retryable', nextAttemptAt: new Date() } },
        );
    }
    async inspect(requestId: string) {
        const job = await this.find(requestId);
        if (!job) throw new NotFoundException('작업이 없습니다.');
        return {
            requestId,
            status: job.status,
            dataErased: job.dataErased,
            providerCompleted: job.providerCompleted,
            pendingFileCount: await this.collection(FILES).countDocuments({ requestId, deleted: false }),
            reviewFileCount: await this.collection(FILES).countDocuments({
                requestId,
                deleted: false,
                approvalRequired: true,
            }),
        };
    }
    async reviewFiles(requestId: string) {
        return this.collection(FILES)
            .find(
                { requestId, deleted: false, approvalRequired: true },
                { projection: { _id: 0, objectKey: 1, notBefore: 1 } },
            )
            .limit(100)
            .toArray();
    }
}
