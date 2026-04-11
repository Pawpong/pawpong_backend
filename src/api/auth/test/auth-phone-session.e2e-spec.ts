import request from 'supertest';

import {
    AuthE2eContext,
    closeAuthE2eContext,
    createAuthE2eContext,
    createPhoneNumber,
    registerAdopter,
} from './fixtures/auth.e2e.fixture';

describe('인증 전화번호와 세션 종단간 테스트', () => {
    let context: AuthE2eContext;

    beforeAll(async () => {
        context = await createAuthE2eContext();
    });

    afterAll(async () => {
        await closeAuthE2eContext(context);
    });

    describe('전화번호 인증', () => {
        it('인증번호 발송에 성공한다', async () => {
            const phone = createPhoneNumber();

            const response = await request(context.app.getHttpServer())
                .post('/api/auth/phone/send-code')
                .send({ phone })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.success).toBe(true);
            expect(response.body.data.message).toBe('인증번호가 발송되었습니다.');
            expect(context.capturedVerificationCodes.get(phone)).toMatch(/^[0-9]{6}$/);
        });

        it('인증코드 확인에 성공한다', async () => {
            const phone = createPhoneNumber();

            await request(context.app.getHttpServer()).post('/api/auth/phone/send-code').send({ phone }).expect(200);

            const code = context.capturedVerificationCodes.get(phone);
            expect(code).toBeDefined();

            const response = await request(context.app.getHttpServer())
                .post('/api/auth/phone/verify-code')
                .send({ phone, code })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.success).toBe(true);
            expect(response.body.data.message).toBe('전화번호 인증이 완료되었습니다.');
        });

        it('잘못된 인증코드면 실패한다', async () => {
            const phone = createPhoneNumber();

            await request(context.app.getHttpServer()).post('/api/auth/phone/send-code').send({ phone }).expect(200);

            await request(context.app.getHttpServer())
                .post('/api/auth/phone/verify-code')
                .send({ phone, code: '000000' })
                .expect(400);
        });
    });

    describe('토큰 재발급', () => {
        let refreshToken: string;

        beforeAll(async () => {
            const response = await registerAdopter(context.app).expect(200);
            refreshToken = response.body.data.refreshToken;
        });

        it('유효한 토큰이면 재발급에 성공한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.message).toBe('토큰이 재발급되었습니다.');
        });

        it('유효하지 않은 토큰이면 실패한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            expect([400, 401]).toContain(response.status);
        });

        it('토큰이 없으면 실패한다', async () => {
            await request(context.app.getHttpServer()).post('/api/auth/refresh').send({}).expect(400);
        });
    });

    describe('로그아웃', () => {
        let accessToken: string;

        beforeAll(async () => {
            const response = await registerAdopter(context.app).expect(200);
            accessToken = response.body.data.accessToken;
        });

        it('유효한 토큰이면 로그아웃에 성공한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.success).toBe(true);
            expect(response.body.data.loggedOutAt).toBeDefined();
            expect(response.body.message).toBe('로그아웃되었습니다.');
        });

        it('토큰이 없으면 실패한다', async () => {
            await request(context.app.getHttpServer()).post('/api/auth/logout').expect(401);
        });

        it('유효하지 않은 토큰이면 실패한다', async () => {
            await request(context.app.getHttpServer())
                .post('/api/auth/logout')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });
});
