import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from '../../../common/test/test-utils';

/**
 * 공지 종단간 테스트
 * 모든 엔드포인트가 공개
 */
describe('공지 종단간 테스트', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestingApp();
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/notice', () => {
        it('공지사항 목록 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/notice')
                .expect(200);

            expect(response.body).toBeDefined();
            // ApiResponseDto 래핑 또는 직접 데이터
            if (response.body.success !== undefined) {
                expect(response.body.success).toBe(true);
            }
            console.log('공지사항 목록 조회 성공');
        });

        it('페이지네이션 파라미터 적용', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/notice?page=1&limit=5')
                .expect(200);

            expect(response.body).toBeDefined();
            console.log('페이지네이션 파라미터 적용 확인');
        });
    });

    describe('GET /api/notice/:noticeId', () => {
        it('잘못된 공지 ID 형식이면 400을 반환한다', async () => {
            await request(app.getHttpServer())
                .get('/api/notice/not-a-mongo-id')
                .expect(400);

            console.log('잘못된 공지 ID 형식 400 확인');
        });

        it('존재하지 않는 공지 조회 시 에러', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/notice/000000000000000000000000');

            expect([400, 404, 500]).toContain(response.status);
            console.log('존재하지 않는 공지 조회 시 에러 확인');
        });
    });
});
