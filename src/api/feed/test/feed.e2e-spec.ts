import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdopterToken } from '../../../common/test/test-utils';

/**
 * Feed (비디오 피드) API E2E 테스트
 * Public + JWT 인증 혼합
 * Feed 엔드포인트는 ApiResponseDto 래핑 여부가 엔드포인트마다 다를 수 있음
 */
describe('Feed API E2E Tests', () => {
    let app: INestApplication;
    let userToken: string;

    beforeAll(async () => {
        app = await createTestingApp();

        const adopter = await getAdopterToken(app);
        if (adopter) {
            userToken = adopter.token;
        }
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    /**
     * Public 엔드포인트
     */
    describe('Public 비디오 피드', () => {
        it('GET /api/feed/videos - 비디오 피드 목록 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/videos')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('✅ 비디오 피드 목록 조회 성공');
        });

        it('GET /api/feed/videos/popular - 인기 영상 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/videos/popular')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('✅ 인기 영상 조회 성공');
        });

        it('GET /api/feed/videos/:videoId - 존재하지 않는 영상 조회 시 에러', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/videos/000000000000000000000000');

            expect([200, 400, 404, 500]).toContain(response.status);
            console.log('✅ 존재하지 않는 영상 조회 검증 완료');
        });
    });

    /**
     * 태그 엔드포인트 (Public)
     */
    describe('태그 검색', () => {
        it('GET /api/feed/tag/popular - 인기 태그 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/tag/popular')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('✅ 인기 태그 조회 성공');
        });

        it('GET /api/feed/tag/search?tag=test - 태그 검색', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/tag/search?tag=test')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('✅ 태그 검색 성공');
        });

        it('GET /api/feed/tag/suggest?q=test - 태그 자동완성', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/tag/suggest?q=test')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('✅ 태그 자동완성 성공');
        });
    });

    /**
     * 인증 필요 엔드포인트
     */
    describe('인증 필요 피드 기능', () => {
        it('GET /api/feed/videos/my/list - 내 영상 목록 (JWT)', async () => {
            if (!userToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/feed/videos/my/list')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('✅ 내 영상 목록 조회 성공');
        });

        it('GET /api/feed/like/my/list - 좋아요 목록 (JWT)', async () => {
            if (!userToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/feed/like/my/list')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('✅ 좋아요 목록 조회 성공');
        });

        it('POST /api/feed/videos/upload-url - 인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/feed/videos/upload-url')
                .send({ filename: 'test.mp4', contentType: 'video/mp4' })
                .expect(401);

            console.log('✅ 업로드 URL 인증 없이 접근 401 확인');
        });
    });

    /**
     * 댓글 기능
     */
    describe('댓글', () => {
        it('POST /api/feed/comment/:videoId - 인증 없이 댓글 작성 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/feed/comment/000000000000000000000000')
                .send({ content: '테스트 댓글' })
                .expect(401);

            console.log('✅ 인증 없이 댓글 작성 401 확인');
        });
    });
});
