import request from 'supertest';

import {
    BreederManagementE2eContext,
    closeBreederManagementE2eContext,
    createBreederManagementE2eContext,
} from './breeder-management-e2e.fixture';

describe('브리더 관리 개요 종단간 테스트', () => {
    let context: BreederManagementE2eContext;

    beforeAll(async () => {
        context = await createBreederManagementE2eContext();
    });

    afterAll(async () => {
        await closeBreederManagementE2eContext(context);
    });

    describe('대시보드 관리', () => {
        it('대시보드를 조회한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/breeder-management/dashboard')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });

        it('인증이 없으면 실패한다', async () => {
            await request(context.app.getHttpServer()).get('/api/breeder-management/dashboard').expect(401);
        });

        it('입양자는 접근할 수 없다', async () => {
            await request(context.app.getHttpServer())
                .get('/api/breeder-management/dashboard')
                .set('Authorization', `Bearer ${context.adopterToken}`)
                .expect(403);
        });
    });

    describe('프로필 관리', () => {
        it('프로필을 조회한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/breeder-management/profile')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });

        it('프로필 수정 요청을 처리한다', async () => {
            const response = await request(context.app.getHttpServer())
                .patch('/api/breeder-management/profile')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    profile: {
                        description: '업데이트된 프로필 설명',
                        experienceYears: 5,
                    },
                });

            expect([200, 400]).toContain(response.status);
        });

        it('프로필은 인증 없이 조회할 수 없다', async () => {
            await request(context.app.getHttpServer()).get('/api/breeder-management/profile').expect(401);
        });
    });

    describe('응답 형식 검증', () => {
        it('표준 응답 형식을 유지한다', async () => {
            const response = await request(context.app.getHttpServer())
                .get('/api/breeder-management/dashboard')
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('code', 200);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
        });
    });
});
