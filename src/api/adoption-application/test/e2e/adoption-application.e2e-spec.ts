import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { JwtService } from '@nestjs/jwt';

import { createTestingApp } from '../../../../common/testing/test-utils';

/**
 * v2 입양 신청 — 라우팅 / 가드 / 동의 검증 / 펫 존재 / 중복 차단 / 정상 저장의 계약 커버리지.
 *
 * 입양자 본인 JWT 는 같은 시크릿으로 직접 sign 해서 보낸다. (계정 가입 e2e 와 분리)
 */
describe('v2 입양 신청 종단간 테스트', () => {
    let app: INestApplication;
    let connection: Connection;
    let jwtService: JwtService;

    async function adopterToken(adopterId: string, email = 'adopter@test.com'): Promise<string> {
        return jwtService.signAsync({ sub: adopterId, email, role: 'adopter' });
    }

    async function brandToken(breederId: string): Promise<string> {
        return jwtService.signAsync({ sub: breederId, email: 'b@test.com', role: 'breeder' });
    }

    async function seedPet(overrides: Record<string, unknown> = {}): Promise<{ petId: string; breederId: string }> {
        const breederId = new Types.ObjectId();
        const petId = new Types.ObjectId();
        await connection.collection('breeders').insertOne({
            _id: breederId,
            emailAddress: 'breeder@test.com',
            nickname: '브리더',
            accountStatus: 'active',
            verification: { plan: 'basic', level: 'new' },
            stats: {},
            profile: { description: '', location: { city: '', district: '' } },
        } as any);
        await connection.collection('available_pets').insertOne({
            _id: petId,
            breederId,
            name: '레오파드 게코',
            breed: '레오파드',
            gender: 'female',
            birthDate: new Date('2025-12-01'),
            price: 200000,
            status: 'available',
            photos: [],
            isActive: true,
            inquiryCount: 0,
            favoriteCount: 0,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        } as any);
        return { petId: String(petId), breederId: String(breederId) };
    }

    async function seedAdopter(): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('adopters').insertOne({
            _id,
            emailAddress: 'adopter@test.com',
            nickname: '입양자',
            phoneNumber: '01012345678',
            accountStatus: 'active',
            realName: '홍길동',
            favoriteBreederList: [],
            submittedReportList: [],
        } as any);
        return String(_id);
    }

    const validBody = (petId: string) => ({
        petId,
        adoptionPlan: '주택에서 생활합니다',
        familyMembers: '본인 1명',
        privacyConsent: true,
        basicCareConsent: true,
        emergencyCareConsent: true,
        allFamilyConsent: true,
    });

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
        jwtService = app.get(JwtService);
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await connection.collection('adoption_applications').deleteMany({});
        await connection.collection('available_pets').deleteMany({});
        await connection.collection('breeders').deleteMany({});
        await connection.collection('adopters').deleteMany({});
    });

    it('비로그인 → 401', async () => {
        const { petId } = await seedPet();
        await request(app.getHttpServer()).post('/api/v2/adoption-application').send(validBody(petId)).expect(401);
    });

    it('브리더 role 로 호출 → 403 (StrictRolesGuard adopter 강제)', async () => {
        const { petId, breederId } = await seedPet();
        const tok = await brandToken(breederId);
        await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(403);
    });

    it('동의 누락(privacyConsent=false) → 400', async () => {
        const adopterId = await seedAdopter();
        const { petId } = await seedPet();
        const tok = await adopterToken(adopterId);
        const res = await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send({ ...validBody(petId), privacyConsent: false })
            .expect(400);
        expect(res.body.error).toMatch(/개인정보/);
    });

    it('존재하지 않는 petId → 400', async () => {
        const adopterId = await seedAdopter();
        const tok = await adopterToken(adopterId);
        const fakePetId = new Types.ObjectId().toString();
        await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(fakePetId))
            .expect(400);
    });

    it('status=adopted 펫 → 400 (입양 불가 상태)', async () => {
        const adopterId = await seedAdopter();
        const { petId } = await seedPet({ status: 'adopted' });
        const tok = await adopterToken(adopterId);
        await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(400);
    });

    it('status=reserved 펫 → 400 (이미 예약된 펫에는 신규 신청 불가)', async () => {
        const adopterId = await seedAdopter();
        const { petId } = await seedPet({ status: 'reserved' });
        const tok = await adopterToken(adopterId);
        await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(400);
    });

    it('isActive=false 펫 → 400 (소프트 삭제된 펫)', async () => {
        const adopterId = await seedAdopter();
        const { petId } = await seedPet({ isActive: false });
        const tok = await adopterToken(adopterId);
        await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(400);
    });

    it('정상 — 200 + applicationId + 도큐먼트 저장 (status=consultation_pending, 비정규화 필드 채움)', async () => {
        const adopterId = await seedAdopter();
        const { petId, breederId } = await seedPet();
        const tok = await adopterToken(adopterId);

        const res = await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('consultation_pending');
        const applicationId = res.body.data.applicationId;
        expect(typeof applicationId).toBe('string');

        const doc = await connection
            .collection('adoption_applications')
            .findOne({ _id: new Types.ObjectId(applicationId) });
        expect(doc).not.toBeNull();
        expect(String(doc!.adopterId)).toBe(adopterId);
        expect(String(doc!.breederId)).toBe(breederId);
        expect(String(doc!.petId)).toBe(petId);
        expect(doc!.status).toBe('consultation_pending');
        expect(doc!.standardResponses.canProvideBasicCare).toBe(true);
        expect(doc!.standardResponses.canAffordMedicalExpenses).toBe(true);
        expect(doc!.standardResponses.adoptionPlan).toBe('주택에서 생활합니다');
        expect(doc!.standardResponses.familyMembers).toBe('본인 1명');
        expect(doc!.petName).toBe('레오파드 게코');
        expect(doc!.adopterName).toBe('홍길동');
    });

    it('중복 신청 — 처리 중 신청 있으면 409', async () => {
        const adopterId = await seedAdopter();
        const { petId } = await seedPet();
        const tok = await adopterToken(adopterId);
        await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(200);
        await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(409);
    });

    it('use-case 사전 체크 — 처리 중 신청이 미리 있으면 두 번째 POST 가 409 로 차단된다', async () => {
        // v1 collection 공유 회귀 방지를 위해 partial unique index 는 도입하지 않는다.
        // 동시성 보호는 application 계층의 existsOpenApplicationForPet 사전 체크에만 의존:
        // 1) 처리 중 도큐먼트를 직접 인서트해 사전 체크가 잡는 케이스를 검증
        // 2) "거의 동시" race window 는 사용자가 같은 펫에 빠르게 두 번 누르는 극히 좁은 경우로 한정.
        const adopterId = await seedAdopter();
        const { petId, breederId } = await seedPet();
        await connection.collection('adoption_applications').insertOne({
            adopterId: new Types.ObjectId(adopterId),
            breederId: new Types.ObjectId(breederId),
            petId: new Types.ObjectId(petId),
            status: 'consultation_pending',
            standardResponses: {
                privacyConsent: true,
                familyMembers: '본인',
                allFamilyConsent: true,
                canProvideBasicCare: true,
                canAffordMedicalExpenses: true,
            },
            appliedAt: new Date(),
        } as any);
        const tok = await adopterToken(adopterId);
        const res = await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(409);
        expect(res.body.error).toMatch(/이미 처리 중인 상담 신청/);
        const count = await connection
            .collection('adoption_applications')
            .countDocuments({ adopterId: new Types.ObjectId(adopterId), petId: new Types.ObjectId(petId) });
        expect(count).toBe(1);
    });

    it('v1 호환 — v1 컬렉션 공유 시나리오에 신규 unique 인덱스가 도입되지 않음 (회귀 차단 확인)', async () => {
        // v1 의 별개 중복 정책(adopter+breeder)과 충돌하지 않도록 collection-level unique 인덱스를 두지 않는다.
        // 동일 adopter × pet 의 처리 중 v1-style 도큐먼트 두 개가 DB-단에서 거부되지 않음을 직접 확인해
        // 후속 변경이 우연히 unique 인덱스를 추가하는 회귀를 가드한다.
        const adopterId = await seedAdopter();
        const petId = new Types.ObjectId();
        const baseDoc = {
            adopterId: new Types.ObjectId(adopterId),
            breederId: new Types.ObjectId(),
            petId,
            status: 'consultation_pending',
            standardResponses: {
                privacyConsent: true,
                familyMembers: '본인',
                allFamilyConsent: true,
                canProvideBasicCare: true,
                canAffordMedicalExpenses: true,
            },
            appliedAt: new Date(),
        };
        await expect(
            connection.collection('adoption_applications').insertMany([{ ...baseDoc }, { ...baseDoc }]),
        ).resolves.toBeDefined();
        const count = await connection
            .collection('adoption_applications')
            .countDocuments({ adopterId: new Types.ObjectId(adopterId), petId });
        expect(count).toBe(2);
    });

    it('종결 신청(adoption_rejected) 이후 재신청 허용 → 200', async () => {
        const adopterId = await seedAdopter();
        const { petId, breederId } = await seedPet();
        await connection.collection('adoption_applications').insertOne({
            adopterId: new Types.ObjectId(adopterId),
            breederId: new Types.ObjectId(breederId),
            petId: new Types.ObjectId(petId),
            status: 'adoption_rejected',
            standardResponses: {
                privacyConsent: true,
                familyMembers: '본인',
                allFamilyConsent: true,
                canProvideBasicCare: true,
                canAffordMedicalExpenses: true,
            },
            appliedAt: new Date(),
        } as any);
        const tok = await adopterToken(adopterId);
        await request(app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${tok}`)
            .send(validBody(petId))
            .expect(200);
    });
});
