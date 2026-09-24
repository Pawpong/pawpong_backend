import { Types } from 'mongoose';
import type { DeletionAccount, DeletionOperation, DeletionPlan } from '../application/ports/account-deletion.port';

type DeletionRow = Record<string, unknown> & {
    _id?: unknown;
    authorId?: unknown;
    adopterId?: unknown;
    breederId?: unknown;
    nickname?: string;
    messageType?: string;
    content?: string;
    status?: string;
    answers?: Array<{ breederId?: unknown; [key: string]: unknown }>;
    customResponses?: Array<{ questionType?: string; answer?: unknown }>;
};
export type DeletionRows = Record<string, DeletionRow[]>;
const REMOVED = '삭제된 사용자';
const objectIds = (rows: DeletionRow[] = []) => rows.map((row) => row._id);
const strings = (values: unknown[]) => [...new Set(values.filter(Boolean).map(String))];

/** 삭제 대상은 인증된 계정과 DB에서 확인한 소유 관계로만 계산한다. 자유 입력을 쿼리로 사용하지 않는다. */
export function buildAccountDeletionPlan(account: DeletionAccount, rows: DeletionRows): DeletionPlan {
    const id = new Types.ObjectId(account.accountId);
    const model = account.role === 'adopter' ? 'Adopter' : 'Breeder';
    const operations: DeletionOperation[] = [];
    const files: string[] = [];
    const addDelete = (collection: string, filter: Record<string, unknown>) => operations.push({ collection, filter });
    const addUpdate = (collection: string, filter: Record<string, unknown>, update: Record<string, unknown>) =>
        operations.push({ collection, filter, update });
    const owned = { authorId: id, authorModel: model };
    const postIds = objectIds(rows.community_post_owned);
    const videoIds = objectIds(rows.video_owned);
    const entryIds = objectIds(rows.contest_entry_owned);
    const petIds = objectIds(rows.available_pets);
    const applicationIds = objectIds(rows.adoption_applications);

    // 본문 전체에서 임의 URL을 지우지 않는다. 업로드 필드/본인 첨부만 manifest로 넘긴다.
    for (const row of rows.account ?? [])
        collectFileValues(
            {
                profileImageFileName: row.profileImageFileName,
                profile: row.profile,
                verification: row.verification,
                submittedReportList: row.submittedReportList,
            },
            files,
        );
    for (const name of [
        'community_post_owned',
        'community_comments',
        'contest_entry_owned',
        'video_owned',
        'ai_image_jobs',
        'available_pets',
        'parent_pets',
        'breeder_pet_posting_drafts',
        'verification_draft',
    ]) {
        for (const row of rows[name] ?? []) collectFileValues(row, files);
    }
    for (const row of rows.chat_messages ?? []) {
        if (row.messageType === 'image' || row.messageType === 'file') {
            try {
                collectAllStrings(JSON.parse(row.content ?? ''), files);
            } catch {
                if (row.content) files.push(row.content);
            }
        }
    }
    for (const row of rows.inquiries ?? []) {
        if (String(row.authorId) === account.accountId) collectFileValues({ imageUrls: row.imageUrls }, files);
        for (const answer of row.answers ?? [])
            if (String(answer.breederId) === account.accountId) collectFileValues(answer, files);
    }
    for (const row of rows.adoption_applications ?? []) {
        // 상담 응답에는 파일형 질문도 있다. 본인 입양자 응답에 있는 첨부만 제거한다.
        if (String(row.adopterId) === account.accountId) {
            for (const response of row.customResponses ?? [])
                if (response.questionType === 'file') collectAllStrings(response.answer, files);
        }
    }
    // AI worker가 뒤늦게 업로드할 때도 삭제 대상 키를 알 수 있도록 예정 결과키를 함께 보존한다.
    for (const row of rows.ai_image_jobs ?? []) files.push(`ai-image/result/${String(row._id)}.png`);

    addUpdate('community_posts', owned, {
        $set: { authorNickname: REMOVED, body: '[삭제된 게시글]', photos: [], title: '' },
        $unset: { authorProfileImageFileName: '' },
    });
    addUpdate('community_post_comments', owned, {
        $set: { authorNickname: REMOVED, body: '[삭제된 댓글]' },
        $unset: { authorProfileImageFileName: '' },
    });
    addUpdate(
        'videos',
        { uploadedBy: id, uploaderModel: model },
        {
            $set: {
                title: '삭제된 동영상',
                description: '',
                originalKey: '',
                hlsManifestKey: '',
                thumbnailKey: '',
                tags: [],
                isPublic: false,
                status: 'failed',
            },
            $unset: { failureReason: '' },
        },
    );
    addUpdate(
        'videocomments',
        { userId: id, userModel: model },
        { $set: { content: '[삭제된 댓글]', isDeleted: true } },
    );
    addDelete('contest_entries', { userId: account.accountId });
    addDelete('ai_image_jobs', { userId: account.accountId, userRole: account.role });

    addUpdate(
        'inquiries',
        { authorId: id },
        { $set: { authorNickname: REMOVED, title: '삭제된 문의', content: '[삭제된 문의]', imageUrls: [] } },
    );
    // 부분 갱신으로 동시에 추가되는 다른 브리더 답변까지 보존한다.
    if (account.role === 'breeder')
        operations.push({
            collection: 'inquiries',
            filter: { 'answers.breederId': id },
            update: {
                $set: {
                    'answers.$[own].breederName': REMOVED,
                    'answers.$[own].profileImageUrl': '',
                    'answers.$[own].content': '[삭제된 답변]',
                    'answers.$[own].imageUrls': [],
                },
            },
            arrayFilters: [{ 'own.breederId': id }],
        });
    if (account.role === 'adopter') {
        addUpdate(
            'adoption_applications',
            { adopterId: id },
            {
                $set: { adopterName: REMOVED, standardResponses: {}, customResponses: [] },
                $unset: { adopterEmail: '', adopterPhone: '' },
            },
        );
        addUpdate('breeder_reviews', { adopterId: id }, { $set: { content: '[삭제된 후기]', isVisible: false } });
    } else {
        // 상대 입양자가 작성한 신청서·후기는 보존하고, 브리더 본인의 메모/답글만 제거한다.
        addUpdate('adoption_applications', { breederId: id }, { $unset: { breederNotes: '' } });
        addUpdate(
            'breeder_reviews',
            { breederId: id },
            { $unset: { replyContent: '', replyWrittenAt: '', replyUpdatedAt: '' } },
        );
        addDelete('available_pets', { breederId: id });
        addDelete('parent_pets', { breederId: id });
        addDelete('breeder_pet_posting_drafts', { breederId: id });
    }
    addUpdate(
        'breeder_reviews',
        { reportedBy: id },
        {
            $set: { isReported: false },
            $unset: { reportedBy: '', reportReason: '', reportDescription: '', reportedAt: '' },
        },
    );
    addUpdate(
        'chat_messages',
        { senderId: account.accountId },
        { $set: { content: '[삭제된 메시지]', messageType: 'text' } },
    );
    // 최종 메시지 미리보기는 뒤에서 남아 있는 메시지로 재계산한다. 방 자체는 닫거나 삭제하지 않는다.
    addUpdate(
        'chat_rooms',
        {
            $or: [
                { participantIds: account.accountId },
                { adopterId: account.accountId },
                { breederId: account.accountId },
            ],
        },
        { $unset: { lastMessage: '' } },
    );

    addDelete('favorites', account.role === 'adopter' ? { adopterId: id } : { breederId: id });
    addDelete('adopter_pet_favorites', { $or: [{ adopterId: id }, { petId: { $in: petIds } }] });
    addDelete('user_follows', { $or: [{ followerId: account.accountId }, { followeeId: account.accountId }] });
    addDelete('chat_user_blocks', { $or: [{ blockerId: account.accountId }, { blockedUserId: account.accountId }] });
    addDelete('community_post_likes', { userId: id, userModel: model });
    addDelete('community_bookmarks', { userId: account.accountId, userModel: model });
    addDelete('videolikes', { userId: id, userModel: model });
    addDelete('contest_votes', { $or: [{ voterId: account.accountId }, { entryId: { $in: entryIds } }] });
    addDelete('notifications', { userId: account.accountId, userRole: account.role });
    addDelete('push_device', { userId: account.accountId, userRole: account.role });
    addDelete('review_credentials', { accountId: id, role: account.role });
    // 별도 법정 보존을 임의로 만들지 않는다. 본인 신고 원문은 삭제하고 상대방 신고 원문은 보존한다.
    addDelete('community_post_reports', { reporterId: id, reporterModel: model });
    addDelete('breeder_reports', { reporterId: id });
    addUpdate(
        'breeders',
        { 'reports.reporterId': account.accountId },
        { $pull: { reports: { reporterId: account.accountId } } },
    );
    for (const collection of ['adopters', 'breeders']) {
        addUpdate(
            collection,
            { 'favoriteBreederList.favoriteBreederId': account.accountId },
            { $pull: { favoriteBreederList: { favoriteBreederId: account.accountId } } },
        );
    }
    // 삭제된 사람을 가리키는 상대방의 알림은 알림 이벤트만 남기고 복제 본문·metadata를 지운다.
    const referencedIds = [
        account.accountId,
        ...applicationIds.map(String),
        ...postIds.map(String),
        ...videoIds.map(String),
        ...entryIds.map(String),
        ...objectIds(rows.community_reports).map(String),
        ...objectIds(rows.breeder_reports).map(String),
    ];
    addUpdate(
        'notifications',
        {
            $or: [
                ...[
                    'userId',
                    'senderId',
                    'authorId',
                    'breederId',
                    'adopterId',
                    'applicationId',
                    'postId',
                    'videoId',
                    'entryId',
                ].map((key) => ({ [`metadata.${key}`]: { $in: referencedIds } })),
                {
                    targetUrl: {
                        $in: applicationIds.map((applicationId) => `/activity/applications/${String(applicationId)}`),
                    },
                },
            ],
        },
        {
            $set: { title: '삭제된 사용자의 알림', body: '연결된 정보가 삭제되었습니다.', metadata: {} },
            $unset: { targetUrl: '' },
        },
    );
    const nickname = rows.account?.[0]?.nickname;
    if (nickname)
        addUpdate(
            'notifications',
            {
                $or: ['commenterNickname', 'replierNickname', 'likerNickname'].map((key) => ({
                    [`metadata.${key}`]: nickname,
                })),
            },
            {
                $set: { title: '삭제된 사용자의 알림', body: '연결된 정보가 삭제되었습니다.', metadata: {} },
                $unset: { targetUrl: '' },
            },
        );
    if (account.role === 'breeder') {
        addUpdate(
            'system_stats',
            { 'breederPerformance.breederId': account.accountId },
            { $pull: { breederPerformance: { breederId: account.accountId } } },
        );
    }
    addUpdate(
        'admins',
        { 'activityLogs.targetId': account.accountId },
        { $pull: { activityLogs: { targetId: account.accountId } } },
    );
    addDelete('ops_pending_events', { referenceId: { $in: referencedIds } });
    addDelete('support_events', { sourceIds: { $in: referencedIds } });
    if (account.role === 'breeder')
        addUpdate('adoption_applications', { petId: { $in: petIds } }, { $set: { petName: '삭제된 동물' } });

    return {
        account,
        operations,
        fileCandidates: [...new Set(files.filter(Boolean))],
        prefixes: videoIds.map((videoId) => `videos/hls/${String(videoId)}/`),
        generatedKeys: [
            ...(rows.ai_image_jobs ?? []).map((row) => `ai-image/result/${String(row._id)}.png`),
            ...videoIds.map((videoId) => `videos/thumbnails/${String(videoId)}.jpg`),
        ],
        affectedBreeders: strings([
            ...(rows.favorites ?? []).map((r) => r.breederId),
            ...(rows.breeder_reviews ?? []).map((r) => r.breederId),
        ]),
        affectedPosts: strings([
            ...(rows.community_post_likes ?? []).map((r) => r.postId),
            ...(rows.community_bookmarks ?? []).map((r) => r.postId),
        ]),
        affectedVideos: strings((rows.video_likes ?? []).map((r) => r.videoId)),
        affectedEntries: strings((rows.contest_votes ?? []).map((r) => r.entryId)),
        affectedContests: strings([
            ...(rows.contest_entry_owned ?? []).map((r) => r.contestId),
            ...(rows.contest_votes ?? []).map((r) => r.contestId),
        ]),
        affectedUsers: strings((rows.user_follows ?? []).flatMap((r) => [r.followerId, r.followeeId])),
        affectedPets: strings((rows.adopter_pet_favorites ?? []).map((r) => r.petId)),
    };
}

/** 스키마의 업로드 필드만 수집한다. 자유 텍스트에 링크된 타인 이미지는 건드리지 않는다. */
export function collectFileValues(value: unknown, target: string[], field = ''): void {
    if (typeof value === 'string') {
        if (field === 'originalFileName') return;
        if (
            /fileName|fileKey|objectKey|photo|imageUrl|representativePhotos|evidenceUrls|healthRecords|originalKey|thumbnailKey|hlsManifestKey/i.test(
                field,
            )
        )
            target.push(value);
    } else if (Array.isArray(value)) value.forEach((item) => collectFileValues(item, target, field));
    else if (value && typeof value === 'object')
        Object.entries(value).forEach(([key, item]) => collectFileValues(item, target, key));
}
function collectAllStrings(value: unknown, target: string[]) {
    if (typeof value === 'string') target.push(value);
    else if (Array.isArray(value)) value.forEach((item) => collectAllStrings(item, target));
    else if (value && typeof value === 'object')
        Object.values(value).forEach((item) => collectAllStrings(item, target));
}
