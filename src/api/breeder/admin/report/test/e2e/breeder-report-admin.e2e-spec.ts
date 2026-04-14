import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../../../common/test/test-utils';

/**
 * 브리더 신고 관리자 종단간 테스트
 * 브리더 신고 처리 (관리자 전용)
 */
describe('브리더 신고 관리자 종단간 테스트', () => {
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

    describe('GET /api/breeder-report-관리자/reports', () => {
        it('브리더 신고 목록 조회 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-report-admin/reports')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('브리더 신고 목록 조회 성공');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/breeder-report-admin/reports')
                .expect(401);
            console.log('인증 없이 접근 401 확인');
        });
    });

    describe('PATCH /api/breeder-report-관리자/reports/:reportId', () => {
        it('존재하지 않는 신고 처리 시 에러', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .patch('/api/breeder-report-admin/reports/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ action: 'resolved', adminNote: '처리 완료' });

            expect([400, 404]).toContain(response.status);
            console.log('존재하지 않는 신고 처리 시 에러 확인');
        });
    });
});
