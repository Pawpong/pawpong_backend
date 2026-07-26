import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp, getAdminToken, getAdopterToken } from '../../../../../common/testing/test-utils';

/**
 * AI 이미지 생성 요청 종단간 테스트.
 *
 * 테스트 환경에는 Kafka 브로커가 없으므로 생성 요청은 503 으로 실패해야 하고,
 * 작업은 대기 상태로 남지 않고 즉시 실패로 확정돼야 한다(유령 작업 방지).
 */
describe('AI 이미지 생성 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let adopterToken: string;
    let filterId: string;
    let inputObjectKey: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = (await getAdminToken(app)) || '';
        const adopter = await getAdopterToken(app);
        adopterToken = adopter?.token || '';

        const filter = await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: '생성 테스트 필터', prompt: '도트 스타일로', model: 'gpt-image-1' });
        filterId = filter.body?.data?.filterId;

        const upload = await request(app.getHttpServer())
            .post('/api/v2/ai-image/upload-url')
            .set('Authorization', `Bearer ${adopterToken}`)
            .send({ contentType: 'image/jpeg' });
        inputObjectKey = upload.body?.data?.inputObjectKey;
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('입력 검증', () => {
        it('존재하지 않는 필터로 요청 시 400', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/ai-image/generation')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ filterId: '000000000000000000000000', inputObjectKey })
                .expect(400);
        });

        it('잘못된 형식의 원본 파일키는 400', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/ai-image/generation')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ filterId, inputObjectKey: 'wrong/path/file.jpg' })
                .expect(400);
        });

        it('인증 없이 요청 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/ai-image/generation')
                .send({ filterId, inputObjectKey })
                .expect(401);
        });
    });

    describe('큐 사용 불가 시 동작 (Kafka 미연결)', () => {
        it('생성 요청은 503 으로 실패한다', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/ai-image/generation')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ filterId, inputObjectKey })
                .expect(503);
        });

        it('실패한 작업은 대기 상태로 남지 않고 failed 로 확정된다', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v2/ai-image/generations')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.data.length).toBeGreaterThan(0);
            const latest = response.body.data[0];
            expect(latest.status).toBe('failed');
            expect(latest.errorCode).toBe('QUEUE_UNAVAILABLE');
        });

        it('실패한 작업은 생성 쿼터에서 제외된다 — 계속 재시도 가능', async () => {
            // 쿼터가 3회인데 실패가 누적돼도 계속 503(쿼터 400 아님)이 나와야 한다
            for (let i = 0; i < 3; i += 1) {
                await request(app.getHttpServer())
                    .post('/api/v2/ai-image/generation')
                    .set('Authorization', `Bearer ${adopterToken}`)
                    .send({ filterId, inputObjectKey })
                    .expect(503);
            }
        });
    });

    describe('상태 조회', () => {
        it('잘못된 jobId 형식은 400', async () => {
            await request(app.getHttpServer())
                .get('/api/v2/ai-image/generation/invalid-job-id')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(400);
        });

        it('존재하지 않는 작업은 400', async () => {
            await request(app.getHttpServer())
                .get('/api/v2/ai-image/generation/000000000000000000000000')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(400);
        });
    });
});
