import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken, getAdopterToken } from '../../../../common/test/test-utils';

/**
 * 브리더 관리 관리자 종단간 테스트
 * 프로필 배너 + 상담 배너 관리 (관리자 전용)
 */
describe('브리더 관리 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let adopterToken: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        const adopter = await getAdopterToken(app);
        adopterToken = adopter?.token || '';
        if (!adminToken) console.log('주의: 관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    /**
     * 프로필 배너
     */
    describe('프로필 배너 관리', () => {
        it('활성 프로필 배너 조회 (공개)', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/breeder-management-admin/profile-banners/active')
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('활성 프로필 배너 조회 성공');
        });

        it('전체 프로필 배너 조회 (Admin)', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management-admin/profile-banners')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('전체 프로필 배너 조회 성공');
        });

        it('인증 없이 전체 프로필 배너 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/breeder-management-admin/profile-banners')
                .expect(401);
            console.log('인증 없이 접근 401 확인');
        });

        it('일반 사용자의 전체 프로필 배너 접근 시 403', async () => {
            if (!adopterToken) { console.log('주의: 스킵'); return; }

            await request(app.getHttpServer())
                .get('/api/breeder-management-admin/profile-banners')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(403);
            console.log('일반 사용자 접근 403 확인');
        });

        it('잘못된 프로필 배너 ID 형식으로 수정 시 400', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .put('/api/breeder-management-admin/profile-banner/invalid-banner-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({})
                .expect(400);

            expect(response.body.message).toContain('올바르지 않은 배너 ID 형식');
            console.log('잘못된 프로필 배너 ID 400 확인');
        });

        it('잘못된 프로필 배너 ID 형식으로 삭제 시 400', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .delete('/api/breeder-management-admin/profile-banner/invalid-banner-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);

            expect(response.body.message).toContain('올바르지 않은 배너 ID 형식');
            console.log('잘못된 프로필 배너 삭제 ID 400 확인');
        });
    });

    /**
     * 상담 배너
     */
    describe('상담 배너 관리', () => {
        it('활성 상담 배너 조회 (공개)', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/breeder-management-admin/counsel-banners/active')
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('활성 상담 배너 조회 성공');
        });

        it('전체 상담 배너 조회 (Admin)', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-management-admin/counsel-banners')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('전체 상담 배너 조회 성공');
        });

        it('잘못된 상담 배너 ID 형식으로 수정 시 400', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .put('/api/breeder-management-admin/counsel-banner/invalid-banner-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({})
                .expect(400);

            expect(response.body.message).toContain('올바르지 않은 배너 ID 형식');
            console.log('잘못된 상담 배너 ID 400 확인');
        });

        it('잘못된 상담 배너 ID 형식으로 삭제 시 400', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .delete('/api/breeder-management-admin/counsel-banner/invalid-banner-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);

            expect(response.body.message).toContain('올바르지 않은 배너 ID 형식');
            console.log('잘못된 상담 배너 삭제 ID 400 확인');
        });
    });
});
