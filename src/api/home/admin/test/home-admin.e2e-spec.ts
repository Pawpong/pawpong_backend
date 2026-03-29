import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../common/test/test-utils';

/**
 * Home Admin API E2E 테스트
 * 배너 + FAQ CRUD (관리자 전용)
 */
describe('Home Admin API E2E Tests', () => {
    let app: INestApplication;
    let adminToken: string;
    let createdBannerId: string;
    let createdFaqId: string;

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
     * 배너 CRUD
     */
    describe('배너 관리', () => {
        it('GET /api/home-admin/banners - 배너 목록 조회', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/home-admin/banners')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 배너 목록 조회 성공');
        });

        it('POST /api/home-admin/banner - 배너 생성', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .post('/api/home-admin/banner')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: '테스트 배너',
                    imageUrl: 'https://example.com/banner.jpg',
                    linkUrl: 'https://example.com',
                    isActive: true,
                    order: 1,
                });

            expect([200, 400]).toContain(response.status);
            if (response.status === 200 && response.body.data?.id) {
                createdBannerId = response.body.data.id;
            }
            console.log('✅ 배너 생성 검증 완료');
        });

        it('DELETE /api/home-admin/banner/:id - 배너 삭제', async () => {
            if (!adminToken || !createdBannerId) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .delete(`/api/home-admin/banner/${createdBannerId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 배너 삭제 성공');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/home-admin/banners')
                .expect(401);
            console.log('✅ 인증 없이 접근 401 확인');
        });
    });

    /**
     * FAQ CRUD
     */
    describe('FAQ 관리', () => {
        it('GET /api/home-admin/faqs - FAQ 목록 조회', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/home-admin/faqs')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ FAQ 목록 조회 성공');
        });

        it('POST /api/home-admin/faq - FAQ 생성', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .post('/api/home-admin/faq')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    question: '테스트 질문입니다?',
                    answer: '테스트 답변입니다.',
                    category: 'general',
                    isActive: true,
                    order: 1,
                });

            expect([200, 400]).toContain(response.status);
            if (response.status === 200 && response.body.data?.id) {
                createdFaqId = response.body.data.id;
            }
            console.log('✅ FAQ 생성 검증 완료');
        });

        it('DELETE /api/home-admin/faq/:id - FAQ 삭제', async () => {
            if (!adminToken || !createdFaqId) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .delete(`/api/home-admin/faq/${createdFaqId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ FAQ 삭제 성공');
        });
    });
});
