/**
 * 분양 상세의 "내 신청 상태"(myApplicationId/myApplicationStatus) probe.
 *
 * 신청 없음 / 신청 후 / 거절된 신청만 / 비로그인 / 브리더 본인 조회 다섯 가지를 실제 HTTP 로 확인한다.
 * 재신청 차단(409)과 판정 기준이 일치하는지도 같은 시나리오에서 함께 본다.
 *
 * 실행: pnpm probe:my-application-state
 * 픽스처는 __probe 마커를 달아 만들고 종료 시 반드시 지운다.
 */
import { JwtService } from '@nestjs/jwt';
import { createConnection, Types } from 'mongoose';

const MARKER = `__probe_myapp_${Date.now()}`;
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

const applicationBody = (petId: string) => ({
    petId,
    adoptionPlan: '재택근무라 하루 종일 함께 있을 수 있습니다.',
    familyMembers: '배우자 1명',
    privacyConsent: true,
    basicCareConsent: true,
    emergencyCareConsent: true,
    allFamilyConsent: true,
});

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

    const breederId = new Types.ObjectId();
    const adopterId = new Types.ObjectId();
    const petId = new Types.ObjectId();

    const jwt = new JwtService({ secret: jwtSecret });
    const sign = (id: Types.ObjectId, role: string) =>
        jwt.sign({ sub: id.toString(), email: `${MARKER}_${role}@local`, role }, { expiresIn: '10m' });
    const breederToken = sign(breederId, 'breeder');
    const adopterToken = sign(adopterId, 'adopter');

    const detailPath = `/v2/adoption/${petId.toString()}`;

    try {
        await breeders.insertOne({
            _id: breederId,
            name: `${MARKER}_브리더`,
            nickname: `${MARKER}_브리더`,
            emailAddress: `${MARKER}_breeder@local`,
            accountStatus: 'active',
            createdAt: new Date(),
        } as never);
        await adopters.insertOne({
            _id: adopterId,
            realName: `${MARKER}_입양자`,
            nickname: `${MARKER}_입양자`,
            emailAddress: `${MARKER}_adopter@local`,
            phoneNumber: '010-0000-0001',
            accountStatus: 'active',
            createdAt: new Date(),
        } as never);
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
            inquiryCount: 0,
            favoriteCount: 0,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as never);

        // ---- 1. 신청 전 ----
        const before = await api(baseUrl, 'GET', detailPath, { token: adopterToken });
        check(
            '신청 없음 → 두 필드 모두 undefined',
            before.status === 200 &&
                before.body?.data?.myApplicationId === undefined &&
                before.body?.data?.myApplicationStatus === undefined,
            `id=${before.body?.data?.myApplicationId} status=${before.body?.data?.myApplicationStatus}`,
        );

        // ---- 2. 신청 후 ----
        const created = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterToken,
            body: applicationBody(petId.toString()),
        });
        check('신청 접수', created.status === 200, `status=${created.status}`);
        const applicationId = created.body?.data?.applicationId as string;

        const after = await api(baseUrl, 'GET', detailPath, { token: adopterToken });
        check(
            '신청 후 → myApplicationId 가 실제 신청 id 와 일치',
            after.body?.data?.myApplicationId === applicationId,
            `id=${after.body?.data?.myApplicationId}`,
        );
        check(
            '신청 후 → myApplicationStatus = consultation_pending',
            after.body?.data?.myApplicationStatus === 'consultation_pending',
            `status=${after.body?.data?.myApplicationStatus}`,
        );

        // 판정 기준 일치: 상세가 신청 있다고 말하면 재신청은 반드시 막혀야 한다
        const blocked = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterToken,
            body: applicationBody(petId.toString()),
        });
        check(
            '상세가 신청 있다고 하면 재신청도 실제로 막힌다 (409)',
            blocked.status === 409,
            `status=${blocked.status}`,
        );

        // ---- 3. 비로그인 ----
        const anonymous = await api(baseUrl, 'GET', detailPath);
        check(
            '비로그인 → undefined',
            anonymous.status === 200 && anonymous.body?.data?.myApplicationId === undefined,
            `id=${anonymous.body?.data?.myApplicationId}`,
        );

        // ---- 4. 브리더 본인 조회 ----
        const asBreeder = await api(baseUrl, 'GET', detailPath, { token: breederToken });
        check(
            '브리더 본인 조회 → undefined',
            asBreeder.status === 200 && asBreeder.body?.data?.myApplicationId === undefined,
            `id=${asBreeder.body?.data?.myApplicationId}`,
        );

        // ---- 5. 확정 상태도 대상 ----
        await applications.updateOne(
            { _id: new Types.ObjectId(applicationId) },
            { $set: { status: 'adoption_approved' } },
        );
        const approved = await api(baseUrl, 'GET', detailPath, { token: adopterToken });
        check(
            '확정(adoption_approved) 신청도 내려간다',
            approved.body?.data?.myApplicationStatus === 'adoption_approved',
            `status=${approved.body?.data?.myApplicationStatus}`,
        );

        // ---- 6. 거절만 남으면 다시 undefined ----
        await applications.updateOne(
            { _id: new Types.ObjectId(applicationId) },
            { $set: { status: 'adoption_rejected' } },
        );
        const rejected = await api(baseUrl, 'GET', detailPath, { token: adopterToken });
        check(
            '거절된 신청만 있으면 → undefined (재신청 가능해야 하므로)',
            rejected.body?.data?.myApplicationId === undefined &&
                rejected.body?.data?.myApplicationStatus === undefined,
            `id=${rejected.body?.data?.myApplicationId} status=${rejected.body?.data?.myApplicationStatus}`,
        );

        const reapply = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterToken,
            body: applicationBody(petId.toString()),
        });
        check(
            '거절 뒤에는 상세도 재신청도 모두 열려 있다 (기준 일치)',
            reapply.status === 200,
            `status=${reapply.status}`,
        );

        // ---- 7. 목록에는 넣지 않았는지 ----
        const list = await api(baseUrl, 'GET', `/v2/adoption?breederId=${breederId.toString()}`, {
            token: adopterToken,
        });
        const listItem = (list.body?.data?.items ?? []).find((item: Json) => item.petId === petId.toString());
        check(
            '목록 응답에는 내 신청 필드가 없다 (N+1 방지)',
            Boolean(listItem) && !('myApplicationId' in (listItem ?? {})),
            listItem ? `keys 포함 여부=${'myApplicationId' in listItem}` : '항목 없음',
        );
    } finally {
        await Promise.all([
            breeders.deleteMany({ _id: breederId }),
            adopters.deleteMany({ _id: adopterId }),
            pets.deleteMany({ _id: petId }),
            applications.deleteMany({ petId }),
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
