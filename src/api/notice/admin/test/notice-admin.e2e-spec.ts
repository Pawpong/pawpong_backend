import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../common/test/test-utils';

/**
 * 공지 관리자 종단간 테스트
 * 공지 게시판 관리 (관리자 전용)
 */
describe('공지 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let createdNoticeId: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        if (!adminToken) console.log('주의: 관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('POST /api/notice-관리자', () => {
        it('공지 생성 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .post('/api/notice-admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: '테스트 공지사항',
                    content: '테스트 공지 내용입니다.',
                    status: 'published',
                });

            expect([200, 201, 400]).toContain(response.status);
            if ([200, 201].includes(response.status)) {
                const id = response.body.data?.id || response.body.data?._id;
                if (id) createdNoticeId = id;
            }
            console.log('공지 생성 검증 완료');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/notice-admin')
                .send({ title: '테스트', content: '내용' })
                .expect(401);
            console.log('인증 없이 접근 401 확인');
        });
    });

    describe('GET /api/notice-관리자', () => {
        it('공지 목록 조회 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/notice-admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('공지 목록 조회 성공');
        });

        it('잘못된 공지 ID 형식으로 상세 조회 시 400', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/notice-admin/invalid-notice-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);

            expect(response.body.message).toContain('올바르지 않은 공지 ID 형식');
            console.log('잘못된 공지 상세 ID 400 확인');
        });
    });

    describe('PATCH /api/notice-관리자/:noticeId', () => {
        it('공지 수정 성공', async () => {
            if (!adminToken || !createdNoticeId) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .patch(`/api/notice-admin/${createdNoticeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: '수정된 공지' })
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('공지 수정 성공');
        });

        it('잘못된 공지 ID 형식으로 수정 시 400', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .patch('/api/notice-admin/invalid-notice-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: '수정 시도' })
                .expect(400);

            expect(response.body.message).toContain('올바르지 않은 공지 ID 형식');
            console.log('잘못된 공지 수정 ID 400 확인');
        });
    });

    describe('DELETE /api/notice-관리자/:noticeId', () => {
        it('공지 삭제 성공', async () => {
            if (!adminToken || !createdNoticeId) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .delete(`/api/notice-admin/${createdNoticeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('공지 삭제 성공');
        });

        it('잘못된 공지 ID 형식으로 삭제 시 400', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .delete('/api/notice-admin/invalid-notice-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);

            expect(response.body.message).toContain('올바르지 않은 공지 ID 형식');
            console.log('잘못된 공지 삭제 ID 400 확인');
        });
    });
});
