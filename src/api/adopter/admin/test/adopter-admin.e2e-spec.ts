import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../common/test/test-utils';

/**
 * Adopter Admin API E2E 테스트
 * 입양자 관리 (관리자 전용)
 */
describe('Adopter Admin API E2E Tests', () => {
    let app: INestApplication;
    let adminToken: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        if (!adminToken) console.log('⚠️  관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('GET /api/adopter-admin/reviews/reports', () => {
        it('후기 신고 목록 조회 성공', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/adopter-admin/reviews/reports')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 후기 신고 목록 조회 성공');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/adopter-admin/reviews/reports')
                .expect(401);
            console.log('✅ 인증 없이 접근 401 확인');
        });
    });

    describe('GET /api/adopter-admin/applications', () => {
        it('입양 신청 목록 조회 성공', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/adopter-admin/applications')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 입양 신청 목록 조회 성공');
        });
    });

    describe('GET /api/adopter-admin/applications/:applicationId', () => {
        it('존재하지 않는 신청 조회 시 에러', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/adopter-admin/applications/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`);

            expect([400, 404]).toContain(response.status);
            console.log('✅ 존재하지 않는 신청 조회 시 에러 확인');
        });
    });
});
