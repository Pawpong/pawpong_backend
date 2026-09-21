/**
 * GET /v2/adopter/profile 을 브리더도 쓸 수 있는지 확인하는 probe.
 *
 * 브리더 토큰 → 200 / 입양자 토큰 → 200 이고 응답 필드 집합이 서로 동일한지(계약 불변) 본다.
 * 실행: pnpm probe:adopter-profile-role
 * 픽스처는 __probe 마커를 달아 만들고 종료 시 반드시 지운다.
 */
import { JwtService } from '@nestjs/jwt';
import { createConnection, Types } from 'mongoose';

const MARKER = `__probe_profile_${Date.now()}`;
const results: Array<{ ok: boolean; label: string; detail?: string }> = [];

function check(label: string, ok: boolean, detail?: string): void {
    results.push({ ok, label, detail });
    console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
}

type Json = Record<string, any>;

async function api(baseUrl: string, path: string, token?: string): Promise<{ status: number; body: Json }> {
    const response = await fetch(`${baseUrl}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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

async function main(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    const jwtSecret = process.env.JWT_SECRET;
    const baseUrl = `http://localhost:${process.env.PORT ?? '8080'}/api`;
    if (!mongoUri || !jwtSecret) throw new Error('MONGODB_URI와 JWT_SECRET이 필요합니다.');

    const connection = createConnection(mongoUri);
    await connection.asPromise();
    const breeders = connection.collection('breeders');
    const adopters = connection.collection('adopters');

    const breederId = new Types.ObjectId();
    const adopterId = new Types.ObjectId();

    const jwt = new JwtService({ secret: jwtSecret });
    const sign = (id: Types.ObjectId, role: string) =>
        jwt.sign({ sub: id.toString(), email: `${MARKER}_${role}@local`, role }, { expiresIn: '10m' });

    try {
        await breeders.insertOne({
            _id: breederId,
            name: `${MARKER}_켄넬`,
            emailAddress: `${MARKER}_breeder@local`,
            phoneNumber: '010-1111-2222',
            accountStatus: 'active',
            favoriteBreederList: [],
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-02-01'),
        } as never);
        await adopters.insertOne({
            _id: adopterId,
            realName: `${MARKER}_입양자`,
            nickname: `${MARKER}_입양자`,
            emailAddress: `${MARKER}_adopter@local`,
            phoneNumber: '010-3333-4444',
            accountStatus: 'active',
            favoriteBreederList: [],
            adoptionApplicationList: [],
            writtenReviewList: [],
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-02-01'),
        } as never);

        const asBreeder = await api(baseUrl, '/v2/adopter/profile', sign(breederId, 'breeder'));
        check('브리더 토큰으로 200', asBreeder.status === 200, `status=${asBreeder.status}`);

        const asAdopter = await api(baseUrl, '/v2/adopter/profile', sign(adopterId, 'adopter'));
        check('입양자 토큰으로 200 (기존 동작 유지)', asAdopter.status === 200, `status=${asAdopter.status}`);

        const breederData = asBreeder.body?.data ?? {};
        const adopterData = asAdopter.body?.data ?? {};

        check(
            '응답 필드 집합이 두 역할에서 동일 (DTO 계약 불변)',
            JSON.stringify(Object.keys(breederData).sort()) === JSON.stringify(Object.keys(adopterData).sort()),
            `breeder=${Object.keys(breederData).sort().join(',')}`,
        );

        check(
            '브리더 nickname 이 브리더명으로 채워짐',
            breederData.nickname === `${MARKER}_켄넬`,
            `nickname=${breederData.nickname}`,
        );
        check(
            '브리더 emailAddress 가 채워짐',
            breederData.emailAddress === `${MARKER}_breeder@local`,
            `email=${breederData.emailAddress}`,
        );
        check(
            'counselDefaultProfile 이 키로 존재하고 null (조사 건너뜀 분기 보호)',
            'counselDefaultProfile' in breederData && breederData.counselDefaultProfile === null,
            `value=${JSON.stringify(breederData.counselDefaultProfile)}`,
        );
        check(
            '입양자 고유 이력이 빈 배열',
            Array.isArray(breederData.adoptionApplicationList) &&
                breederData.adoptionApplicationList.length === 0 &&
                Array.isArray(breederData.writtenReviewList) &&
                breederData.writtenReviewList.length === 0,
        );
        check(
            'phoneNumber·accountStatus 가 빈 값이 아님',
            breederData.phoneNumber === '010-1111-2222' && breederData.accountStatus === 'active',
            `phone=${breederData.phoneNumber} status=${breederData.accountStatus}`,
        );
        check(
            '입양자 응답 필드 값이 기존과 동일하게 채워짐',
            adopterData.nickname === `${MARKER}_입양자` && adopterData.emailAddress === `${MARKER}_adopter@local`,
            `nickname=${adopterData.nickname}`,
        );
        check(
            '비로그인은 그대로 401',
            (await api(baseUrl, '/v2/adopter/profile')).status === 401,
        );
    } finally {
        await Promise.all([breeders.deleteMany({ _id: breederId }), adopters.deleteMany({ _id: adopterId })]);
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
