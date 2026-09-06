import mongoose from 'mongoose';

/**
 * notifications.targetUrl 오타 교정 마이그레이션.
 *
 * community_post_liked 알림이 API 경로(`/community/posts/{id}`)를 프론트 링크로 그대로 써서
 * 존재하지 않는 라우트로 보내고 있었다. 프론트 실제 라우트는 단수 `/community/post/{id}` 다.
 * 코드는 고쳤지만 이미 쌓인 알림은 계속 404 로 가므로 여기서 함께 교정한다.
 *
 * 이미 단수 경로인 문서는 대상에서 제외하므로 여러 번 실행해도 안전하다(멱등).
 * 기본은 dry-run 이고 --apply 를 준 경우에만 실제로 갱신한다.
 */

const WRONG_PREFIX = '/community/posts/';
const CORRECT_PREFIX = '/community/post/';

type NotificationRecord = {
    _id: mongoose.Types.ObjectId;
    targetUrl?: string;
};

export type CommunityTargetUrlMigrationSummary = {
    dryRun: boolean;
    /** 잘못된 복수형 경로를 가진 알림 수 */
    matched: number;
    /** 실제로 갱신한(dry-run 이면 갱신할) 알림 수 */
    updated: number;
    samples: Array<{ id: string; before: string; after: string }>;
};

export async function migrateCommunityTargetUrl(
    connection: mongoose.Connection,
    options: { dryRun: boolean },
): Promise<CommunityTargetUrlMigrationSummary> {
    const notifications = connection.collection<NotificationRecord>('notifications');

    const targets = await notifications
        .find({ targetUrl: { $regex: `^${WRONG_PREFIX}` } })
        .project({ _id: 1, targetUrl: 1 })
        .toArray();

    const samples = targets.slice(0, 10).map((doc) => ({
        id: String(doc._id),
        before: doc.targetUrl ?? '',
        after: (doc.targetUrl ?? '').replace(WRONG_PREFIX, CORRECT_PREFIX),
    }));

    let updated = 0;
    if (!options.dryRun) {
        for (const doc of targets) {
            const fixed = (doc.targetUrl ?? '').replace(WRONG_PREFIX, CORRECT_PREFIX);
            await notifications.updateOne({ _id: doc._id }, { $set: { targetUrl: fixed } });
            updated += 1;
        }
    } else {
        updated = targets.length;
    }

    return { dryRun: options.dryRun, matched: targets.length, updated, samples };
}

async function main(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI 가 필요합니다.');

    // 실수로 쓰기가 일어나지 않도록 기본은 dry-run 이고, --apply 를 준 경우에만 실제로 갱신한다.
    const isDryRun = !process.argv.includes('--apply');

    const connection = mongoose.createConnection(mongoUri);
    await connection.asPromise();
    try {
        const summary = await migrateCommunityTargetUrl(connection, { dryRun: isDryRun });
        console.log(JSON.stringify(summary, null, 2));
        if (isDryRun) {
            console.log('[dry-run] 실제로 갱신하지 않았습니다. 적용하려면 --apply 를 붙여 다시 실행하세요.');
        }
    } finally {
        await connection.close();
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error('마이그레이션 실패:', error);
        process.exitCode = 1;
    });
}
