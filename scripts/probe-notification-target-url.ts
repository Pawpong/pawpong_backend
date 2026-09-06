/**
 * 알림 targetUrl probe — 눌렀을 때 이동할 곳이 실제로 저장되는지 확인한다.
 *
 * 실행: pnpm probe:notification-target-url
 */
import { JwtService } from '@nestjs/jwt';
import { createConnection, Types } from 'mongoose';

const MARKER = `__probe_noti_${Date.now()}`;
const results: Array<{ ok: boolean; label: string; detail?: string }> = [];

function check(label: string, ok: boolean, detail?: string): void {
    results.push({ ok, label, detail });
    console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
}

type Json = Record<string, any>;

async function api(
    baseUrl: string,
    method: string,
    path: string,
    options: { token?: string; body?: Json } = {},
): Promise<{ status: number; body: Json }> {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    const text = await response.text();
    let body: Json = {};
    try {
        body = text ? JSON.parse(text) : {};
    } catch {
        body = { raw: text };
    }
    return { status: response.status, body };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    const jwtSecret = process.env.JWT_SECRET;
    const baseUrl = `http://localhost:${process.env.PORT ?? '8080'}/api`;
    if (!mongoUri || !jwtSecret) throw new Error('MONGODB_URI와 JWT_SECRET이 필요합니다.');

    const connection = createConnection(mongoUri);
    await connection.asPromise();
    const breeders = connection.collection('breeders');
    const adopters = connection.collection('adopters');
    const pets = connection.collection('available_pets');
    const applications = connection.collection('adoption_applications');
    const notifications = connection.collection('notifications');
    const posts = connection.collection('community_posts');

    const breederId = new Types.ObjectId();
    const adopterId = new Types.ObjectId();
    const likerId = new Types.ObjectId();
    const petId = new Types.ObjectId();
    const postId = new Types.ObjectId();

    const jwt = new JwtService({ secret: jwtSecret });
    const sign = (id: Types.ObjectId, role: string) =>
        jwt.sign({ sub: id.toString(), email: `${MARKER}_${role}@local`, role }, { expiresIn: '10m' });

    try {
        await breeders.insertOne({
            _id: breederId,
            name: `${MARKER}_켄넬`,
            emailAddress: `${MARKER}_breeder@local`,
            accountStatus: 'active',
            applicationForm: [],
            favoriteBreederList: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        } as never);
        await adopters.insertMany([
            {
                _id: adopterId,
                realName: `${MARKER}_입양자`,
                nickname: `${MARKER}_입양자`,
                emailAddress: `${MARKER}_adopter@local`,
                accountStatus: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: likerId,
                realName: `${MARKER}_좋아요`,
                nickname: `${MARKER}_좋아요`,
                emailAddress: `${MARKER}_liker@local`,
                accountStatus: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ] as never);
        await pets.insertOne({
            _id: petId,
            breederId,
            name: `${MARKER}_펫`,
            breed: '말티즈',
            petType: 'dog',
            gender: 'female',
            birthDate: new Date('2025-01-01'),
            price: 1000000,
            status: 'available',
            isActive: true,
            photos: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        } as never);

        // ---- 1·2. 상담 신청 → 브리더/신청자 알림 ----
        const created = await api(baseUrl, 'POST', '/v2/adopter/application', {
            token: sign(adopterId, 'adopter'),
            body: {
                breederId: breederId.toString(),
                petId: petId.toString(),
                privacyConsent: true,
                selfIntroduction: '잘 키우겠습니다.',
                familyMembers: '배우자 1명',
                allFamilyConsent: true,
                canProvideBasicCare: true,
                canAffordMedicalExpenses: true,
            },
        });
        check('상담 신청 접수', created.status === 200, `status=${created.status}`);
        const applicationId = created.body?.data?.applicationId as string;
        await delay(700);

        const breederNoti = await notifications.findOne({
            userId: breederId.toString(),
            type: 'new_consult_request',
        });
        check(
            'new_consult_request 에 targetUrl 이 채워진다',
            breederNoti?.targetUrl === `/activity/applications/${applicationId}`,
            `targetUrl=${breederNoti?.targetUrl}`,
        );

        const applicantNoti = await notifications.findOne({
            userId: adopterId.toString(),
            type: 'consult_request_confirmed',
        });
        check(
            'consult_request_confirmed 에 targetUrl 이 채워진다',
            applicantNoti?.targetUrl === `/activity/applications/${applicationId}`,
            `targetUrl=${applicantNoti?.targetUrl}`,
        );

        // ---- 3. 커뮤니티 좋아요 ----
        await posts.insertOne({
            _id: postId,
            authorId: adopterId,
            authorModel: 'Adopter',
            authorNickname: `${MARKER}_입양자`,
            title: `${MARKER} 글`,
            content: '본문',
            category: 'free',
            isActive: true,
            likeCount: 0,
            viewCount: 0,
            commentCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as never);

        const liked = await api(baseUrl, 'POST', `/v2/community/posts/${postId.toString()}/like`, {
            token: sign(likerId, 'adopter'),
        });
        check('커뮤니티 좋아요 요청', liked.status === 200 || liked.status === 201, `status=${liked.status}`);
        await delay(700);

        const likeNoti = await notifications.findOne({
            userId: adopterId.toString(),
            type: 'community_post_liked',
        });
        check(
            'community_post_liked 가 단수 post 경로로 저장된다',
            likeNoti?.targetUrl === `/community/post/${postId.toString()}`,
            `targetUrl=${likeNoti?.targetUrl}`,
        );
        check(
            '존재하지 않는 복수형 경로가 아니다',
            !String(likeNoti?.targetUrl ?? '').includes('/community/posts/'),
        );

        // ---- 공통 계약 ----
        const all = [breederNoti, applicantNoti, likeNoti].filter(Boolean);
        check(
            '모든 알림 targetUrl 이 / 로 시작한다 (프론트 이동 조건)',
            all.length === 3 && all.every((n) => String(n!.targetUrl ?? '').startsWith('/')),
            `count=${all.length}`,
        );
    } finally {
        await Promise.all([
            breeders.deleteMany({ _id: breederId }),
            adopters.deleteMany({ _id: { $in: [adopterId, likerId] } }),
            pets.deleteMany({ _id: petId }),
            applications.deleteMany({ petId }),
            posts.deleteMany({ _id: postId }),
            notifications.deleteMany({ userId: { $in: [breederId.toString(), adopterId.toString()] } }),
        ]);
        await connection.close();
    }

    const failed = results.filter((r) => !r.ok);
    console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`);
    if (failed.length > 0) {
        console.log('실패 항목:');
        for (const f of failed) console.log(`  - ${f.label}${f.detail ? ` (${f.detail})` : ''}`);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error('probe 실패:', error);
    process.exitCode = 1;
});
