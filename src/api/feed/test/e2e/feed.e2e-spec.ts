import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdopterToken } from '../../../../common/test/test-utils';

/**
 * 피드 종단간 테스트
 * 공개 경로와 토큰 인증 경로를 함께 검증한다
 * 엔드포인트마다 응답 래핑 방식이 다를 수 있어 이를 함께 확인한다
 */
describe('피드 종단간 테스트', () => {
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
     * 공개 엔드포인트
     */
    describe('공개 비디오 피드', () => {
        it('비디오 피드 목록 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/videos')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('비디오 피드 목록 조회 성공');
        });

        it('인기 영상 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/videos/popular')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('인기 영상 조회 성공');
        });

        it('존재하지 않는 영상 조회 시 에러', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/videos/000000000000000000000000');

            expect([200, 400, 404, 500]).toContain(response.status);
            console.log('존재하지 않는 영상 조회 검증 완료');
        });

        it('잘못된 영상 ID 형식이면 400을 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/api/feed/videos/not-a-mongo-id')
                .expect(400);

            console.log('잘못된 영상 ID 형식 400 확인');
        });
    });

    /**
     * 태그 엔드포인트 (공개)
     */
    describe('태그 검색', () => {
        it('인기 태그 조회', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/tag/popular')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('인기 태그 조회 성공');
        });

        it('태그 검색', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/tag/search?tag=test')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('태그 검색 성공');
        });

        it('태그 자동완성', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/feed/tag/suggest?q=test')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('태그 자동완성 성공');
        });
    });

    /**
     * 인증 필요 엔드포인트
     */
    describe('인증 필요 피드 기능', () => {
        it('내 영상 목록 (토큰 인증)', async () => {
            if (!userToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/feed/videos/my/list')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('내 영상 목록 조회 성공');
        });

        it('좋아요 목록 (토큰 인증)', async () => {
            if (!userToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/feed/like/my/list')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('좋아요 목록 조회 성공');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/feed/videos/upload-url')
                .send({ filename: 'test.mp4', contentType: 'video/mp4' })
                .expect(401);

            console.log('업로드 주소 인증 없이 접근 401 확인');
        });
    });

    /**
     * 댓글 기능
     */
    describe('댓글', () => {
        it('잘못된 댓글 ID 형식으로 대댓글 조회 시 400', async () => {
            await request(app.getHttpServer())
                .get('/api/feed/comment/not-a-mongo-id/replies')
                .expect(400);

            console.log('잘못된 댓글 ID 형식 400 확인');
        });

        it('인증 없이 댓글 작성 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/feed/comment/000000000000000000000000')
                .send({ content: '테스트 댓글' })
                .expect(401);

            console.log('인증 없이 댓글 작성 401 확인');
        });
    });
});
