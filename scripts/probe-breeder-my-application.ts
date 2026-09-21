/**
 * 분양 상세의 내 신청 상태가 브리더에게도 내려오는지 확인하는 probe.
 *
 * 브리더는 v1 경로(POST /v2/adopter/application)로 다른 브리더의 펫에 신청한다.
 * 실행: pnpm probe:breeder-my-application
 */
import { JwtService } from '@nestjs/jwt';
import { createConnection, Types } from 'mongoose';

const MARKER = `__probe_bma_${Date.now()}`;
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

    const ownerId = new Types.ObjectId();
    const applicantBreederId = new Types.ObjectId();
    const adopterId = new Types.ObjectId();
    const petId = new Types.ObjectId();

    const jwt = new JwtService({ secret: jwtSecret });
    const sign = (id: Types.ObjectId, role: string) =>
        jwt.sign({ sub: id.toString(), email: `${MARKER}_${role}@local`, role }, { expiresIn: '10m' });
    const applicantToken = sign(applicantBreederId, 'breeder');
    const ownerToken = sign(ownerId, 'breeder');
    const adopterToken = sign(adopterId, 'adopter');

    const detailPath = `/v2/adoption/${petId.toString()}`;
    const baseBreeder = (id: Types.ObjectId, label: string) => ({
        _id: id,
        name: `${MARKER}_${label}`,
        emailAddress: `${MARKER}_${label}@local`,
        phoneNumber: '010-0000-0000',
        accountStatus: 'active',
        favoriteBreederList: [],
        applicationForm: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    try {
        await breeders.insertMany([baseBreeder(ownerId, 'owner'), baseBreeder(applicantBreederId, 'applicant')] as never);
        await adopters.insertOne({
            _id: adopterId,
            realName: `${MARKER}_입양자`,
            nickname: `${MARKER}_입양자`,
            emailAddress: `${MARKER}_adopter@local`,
            phoneNumber: '010-1111-1111',
            accountStatus: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        } as never);
        await pets.insertOne({
            _id: petId,
            breederId: ownerId,
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

        // ---- 신청 전 ----
        const before = await api(baseUrl, 'GET', detailPath, { token: applicantToken });
        check(
            '브리더: 신청 전에는 undefined',
            before.status === 200 && before.body?.data?.myApplicationId === undefined,
            `status=${before.status} id=${before.body?.data?.myApplicationId}`,
        );

        // ---- 브리더가 v1 경로로 신청 ----
        const created = await api(baseUrl, 'POST', '/v2/adopter/application', {
            token: applicantToken,
            body: {
                breederId: ownerId.toString(),
                petId: petId.toString(),
                privacyConsent: true,
                selfIntroduction: '브리더 계정으로 다른 브리더의 개체에 상담을 신청합니다.',
                familyMembers: '배우자 1명',
                allFamilyConsent: true,
                canProvideBasicCare: true,
                canAffordMedicalExpenses: true,
            },
        });
        check('브리더 신청 접수', created.status === 200, `status=${created.status} body=${JSON.stringify(created.body).slice(0, 400)}`);

        const applicationDoc = await applications.findOne({
            adopterId: applicantBreederId,
            petId,
        });
        check('신청이 브리더 id 로 저장됨', Boolean(applicationDoc), `id=${applicationDoc?._id}`);

        // ---- 핵심: 브리더에게도 내려오는가 ----
        const after = await api(baseUrl, 'GET', detailPath, { token: applicantToken });
        check(
            '브리더: 신청 후 myApplicationId 가 채워진다 (이번 수정의 핵심)',
            after.body?.data?.myApplicationId === String(applicationDoc?._id),
            `id=${after.body?.data?.myApplicationId}`,
        );
        check(
            '브리더: myApplicationStatus = consultation_pending',
            after.body?.data?.myApplicationStatus === 'consultation_pending',
            `status=${after.body?.data?.myApplicationStatus}`,
        );

        // ---- 자기 분양글을 보는 브리더 ----
        const asOwner = await api(baseUrl, 'GET', detailPath, { token: ownerToken });
        check(
            '자기 분양글 보는 브리더는 undefined (자기 펫에 낸 신청이 없으므로)',
            asOwner.status === 200 && asOwner.body?.data?.myApplicationId === undefined,
            `id=${asOwner.body?.data?.myApplicationId}`,
        );

        // ---- 다른 사용자에게는 안 보인다 ----
        const asAdopter = await api(baseUrl, 'GET', detailPath, { token: adopterToken });
        check(
            '다른 사용자에게는 남의 신청이 안 보인다',
            asAdopter.body?.data?.myApplicationId === undefined,
            `id=${asAdopter.body?.data?.myApplicationId}`,
        );

        // ---- 비로그인 ----
        const anonymous = await api(baseUrl, 'GET', detailPath);
        check('비로그인 → undefined', anonymous.body?.data?.myApplicationId === undefined);

        // ---- 거절되면 다시 열린다 ----
        await applications.updateOne({ _id: applicationDoc!._id }, { $set: { status: 'adoption_rejected' } });
        const rejected = await api(baseUrl, 'GET', detailPath, { token: applicantToken });
        check(
            '거절된 신청만 있으면 → undefined (재신청 가능해야 하므로)',
            rejected.body?.data?.myApplicationId === undefined,
            `id=${rejected.body?.data?.myApplicationId}`,
        );

        // ---- 확정도 대상 ----
        await applications.updateOne({ _id: applicationDoc!._id }, { $set: { status: 'adoption_approved' } });
        const approved = await api(baseUrl, 'GET', detailPath, { token: applicantToken });
        check(
            '확정(adoption_approved) 신청도 브리더에게 내려간다',
            approved.body?.data?.myApplicationStatus === 'adoption_approved',
            `status=${approved.body?.data?.myApplicationStatus}`,
        );
    } finally {
        await Promise.all([
            breeders.deleteMany({ _id: { $in: [ownerId, applicantBreederId] } }),
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
