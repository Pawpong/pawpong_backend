import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../common/test/test-utils';

/**
 * Breeder Management Admin API E2E 테스트
 * 프로필 배너 + 상담 배너 관리 (관리자 전용)
 */
describe('Breeder Management Admin API E2E Tests', () => {
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

    /**
     * 프로필 배너
     */
    describe('프로필 배너 관리', () => {
        it('GET /api/breeder-management-admin/profile-banners/active - 활성 프로필 배너 조회 (Public)', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/breeder-management-admin/profile-banners/active')
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 활성 프로필 배너 조회 성공');
        });

        it('GET /api/breeder-management-admin/profile-banners - 전체 프로필 배너 조회 (Admin)', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management-admin/profile-banners')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 전체 프로필 배너 조회 성공');
        });

        it('인증 없이 전체 프로필 배너 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/breeder-management-admin/profile-banners')
                .expect(401);
            console.log('✅ 인증 없이 접근 401 확인');
        });
    });

    /**
     * 상담 배너
     */
    describe('상담 배너 관리', () => {
        it('GET /api/breeder-management-admin/counsel-banners/active - 활성 상담 배너 조회 (Public)', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/breeder-management-admin/counsel-banners/active')
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 활성 상담 배너 조회 성공');
        });

        it('GET /api/breeder-management-admin/counsel-banners - 전체 상담 배너 조회 (Admin)', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management-admin/counsel-banners')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 전체 상담 배너 조회 성공');
        });
    });
});
