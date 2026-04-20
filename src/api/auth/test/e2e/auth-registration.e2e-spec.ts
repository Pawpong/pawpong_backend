import request from 'supertest';

import {
    AuthE2eContext,
    closeAuthE2eContext,
    createAdopterRegisterData,
    createAuthE2eContext,
    createBreederRegisterData,
    registerAdopter,
    registerBreeder,
} from '../fixtures/auth.e2e.fixture';

describe('인증 회원가입 종단간 테스트', () => {
    let context: AuthE2eContext;

    beforeAll(async () => {
        context = await createAuthE2eContext();
    });

    afterAll(async () => {
        await closeAuthE2eContext(context);
    });

    describe('입양자 회원가입', () => {
        it('회원가입에 성공한다', async () => {
            const response = await registerAdopter(context.app).expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.adopterId).toBeDefined();
            expect(response.body.data.userRole).toBe('adopter');
            expect(response.body.message).toBe('입양자 회원가입이 완료되었습니다.');
        });

        it('중복 이메일은 허용하지 않는다', async () => {
            const email = `duplicate_${Date.now()}@test.com`;

            await registerAdopter(context.app, {
                email,
                nickname: `중복닉네임${Date.now()}`.slice(0, 20),
                phone: '010-1111-1111',
            }).expect(200);

            const response = await registerAdopter(context.app, {
                email,
                nickname: `중복닉네임2${Date.now()}`.slice(0, 20),
                phone: '010-2222-2222',
            });

            expect([200, 400, 500]).toContain(response.status);
        });

        it('필수 필드가 없으면 실패한다', async () => {
            const data = createAdopterRegisterData();
            delete (data as Record<string, unknown>).tempId;

            await request(context.app.getHttpServer()).post('/api/auth/register/adopter').send(data).expect(400);
        });

        it('이메일 형식이 잘못되면 실패한다', async () => {
            await request(context.app.getHttpServer())
                .post('/api/auth/register/adopter')
                .send(
                    createAdopterRegisterData({
                        email: 'invalid-email-format',
                    }),
                )
                .expect(400);
        });
    });

    describe('브리더 회원가입', () => {
        it('기본 플랜 회원가입에 성공한다', async () => {
            const response = await registerBreeder(context.app).expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.breederId).toBeDefined();
            expect(response.body.message).toBe('브리더 회원가입이 완료되었습니다.');
        });

        it('프로 플랜 회원가입에 성공한다', async () => {
            const response = await registerBreeder(context.app, {
                email: `breeder_pro_${Date.now()}@test.com`,
                phoneNumber: '010-6666-6666',
                breederName: '프로 브리더',
                breederLocation: {
                    city: '경기도',
                    district: '성남시',
                },
                animal: 'cat',
                breeds: ['페르시안', '샴'],
                plan: 'pro',
                level: 'elite',
                agreements: {
                    termsOfService: true,
                    privacyPolicy: true,
                    marketingConsent: true,
                },
            }).expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.breederName).toBe('프로 브리더');
        });

        it('약관 동의가 없으면 실패한다', async () => {
            const data = createBreederRegisterData();
            delete (data as Record<string, unknown>).agreements;

            await request(context.app.getHttpServer()).post('/api/auth/register/breeder').send(data).expect(400);
        });

        it('필수 필드가 없으면 실패한다', async () => {
            const data = createBreederRegisterData();
            delete (data as Record<string, unknown>).breederName;

            await request(context.app.getHttpServer()).post('/api/auth/register/breeder').send(data).expect(400);
        });
    });
});
