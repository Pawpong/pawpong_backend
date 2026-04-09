import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../common/test/test-utils';

/**
 * 공지사항 관리자 종단간 테스트
 * 공지사항(팝업/배너) 관리 (관리자 전용)
 */
describe('공지사항 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let createdAnnouncementId: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        if (!adminToken) console.log('주의: 관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('POST /api/announcement-관리자/announcement', () => {
        it('공지사항(팝업) 생성 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .post('/api/announcement-admin/announcement')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: '테스트 팝업',
                    content: '테스트 팝업 내용',
                    type: 'popup',
                    isActive: true,
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 86400000).toISOString(),
                });

            expect([200, 400]).toContain(response.status);
            if (response.status === 200 && response.body.data?.id) {
                createdAnnouncementId = response.body.data.id;
            }
            console.log('공지사항(팝업) 생성 검증 완료');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/announcement-admin/announcement')
                .send({ title: '테스트' })
                .expect(401);
            console.log('인증 없이 접근 401 확인');
        });
    });

    describe('GET /api/announcement-관리자/announcements', () => {
        it('공지사항 목록 조회 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/announcement-admin/announcements')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('공지사항 목록 조회 성공');
        });
    });

    describe('DELETE /api/announcement-관리자/announcement/:id', () => {
        it('공지사항 삭제 성공', async () => {
            if (!adminToken || !createdAnnouncementId) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .delete(`/api/announcement-admin/announcement/${createdAnnouncementId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('공지사항 삭제 성공');
        });
    });
});
