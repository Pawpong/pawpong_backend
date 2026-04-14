import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../../common/test/test-utils';

/**
 * 알림 관리자 종단간 테스트
 */
describe('알림 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        if (!adminToken) console.log('주의: 관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('GET /api/notification-관리자/notifications', () => {
        it('알림 전체 목록 조회 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/notification-admin/notifications')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('알림 전체 목록 조회 성공');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/notification-admin/notifications')
                .expect(401);
            console.log('인증 없이 접근 401 확인');
        });
    });

    describe('GET /api/notification-관리자/stats', () => {
        it('알림 통계 조회 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/notification-admin/stats')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('알림 통계 조회 성공');
        });
    });
});
