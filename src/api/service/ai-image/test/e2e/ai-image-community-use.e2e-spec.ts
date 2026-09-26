import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { AiImageJobStatus } from '../../../../../common/enum/ai-image-job-status.enum';
import {
    cleanupDatabase,
    createTestingApp,
    getAdminToken,
    getAdopterToken,
} from '../../../../../common/testing/test-utils';

/**
 * 커뮤니티 글쓰기에서 쓰는 AI 도트 변환 검증.
 *
 * - 콘테스트 없이 쓰면 하루 3회(KST 자정 초기화)로 센다. 콘테스트 기준이면 평생 3회로 묶인다
 * - 결과 이미지를 API 로 내려받아 일반 사진처럼 다시 올린다 (버킷 CORS 없음)
 *
 * 작업은 컬렉션에 직접 시드한다. 테스트 환경에 Kafka 가 없어 생성이 끝까지 돌지 않기 때문이다.
 */
describe('AI 이미지 — 커뮤니티 사용 (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let filterId: string;
    let owner: { token: string; adopterId: string };
    let other: { token: string; adopterId: string };

    const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
    );

    const buildJob = (userId: string, overrides: Record<string, unknown> = {}) => ({
        userId,
        userRole: 'adopter',
        contestId: null,
        filterId: new Types.ObjectId(filterId),
        inputObjectKey: 'ai-image/source/seed.jpg',
        outputObjectKey: null,
        status: AiImageJobStatus.SUCCEEDED,
        promptSnapshot: '도트 스타일로',
        negativePromptSnapshot: '',
        modelSnapshot: 'gpt-image-1',
        outputSizeSnapshot: '1024x1024',
        attempt: 1,
        errorCode: null,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });

    const requestGeneration = (token: string) =>
        request(app.getHttpServer())
            .post('/api/v2/ai-image/generation')
            .set('Authorization', `Bearer ${token}`)
            .send({ filterId, inputObjectKey: 'ai-image/source/seed.jpg' });

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
        const adminToken = (await getAdminToken(app)) || '';
        owner = (await getAdopterToken(app))!;
        other = (await getAdopterToken(app))!;

        const filter = await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: '커뮤니티 테스트 필터', prompt: '도트 스타일로', model: 'gpt-image-1' });
        filterId = filter.body.data.filterId;
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('일일 쿼터 (콘테스트 없이 사용)', () => {
        it('오늘 3번 만들었으면 더 요청할 수 없다', async () => {
            await connection
                .collection('ai_image_jobs')
                .insertMany([buildJob(owner.adopterId), buildJob(owner.adopterId), buildJob(owner.adopterId)]);

            const response = await requestGeneration(owner.token).expect(400);
            expect(response.body.error ?? response.body.message).toContain('하루 3회');
        });

        it('어제 만든 것과 실패한 것은 오늘 횟수에 들어가지 않는다', async () => {
            const yesterday = new Date(Date.now() - 36 * 60 * 60 * 1000);
            await connection
                .collection('ai_image_jobs')
                .insertMany([
                    buildJob(other.adopterId, { createdAt: yesterday }),
                    buildJob(other.adopterId, { createdAt: yesterday }),
                    buildJob(other.adopterId, { createdAt: yesterday }),
                    buildJob(other.adopterId, { status: AiImageJobStatus.FAILED }),
                ]);

            // 쿼터는 통과하고, 테스트 환경엔 Kafka 가 없어 큐 단계에서 503 이 난다
            await requestGeneration(other.token).expect(503);
        });
    });

    describe('결과 이미지 받기', () => {
        let succeededJobId: string;
        let queuedJobId: string;

        beforeAll(async () => {
            const uploaded = await request(app.getHttpServer())
                .post('/api/v2/ai-image/source')
                .set('Authorization', `Bearer ${owner.token}`)
                .attach('file', png, { filename: 'result.png', contentType: 'image/png' });
            const outputObjectKey = uploaded.body.data.inputObjectKey as string;

            const inserted = await connection.collection('ai_image_jobs').insertMany([
                buildJob(owner.adopterId, { outputObjectKey, createdAt: new Date(0) }),
                buildJob(owner.adopterId, {
                    status: AiImageJobStatus.QUEUED,
                    completedAt: null,
                    createdAt: new Date(0),
                }),
            ]);
            succeededJobId = String(inserted.insertedIds[0]);
            queuedJobId = String(inserted.insertedIds[1]);
        });

        it('본인의 완성된 결과를 PNG 로 내려준다', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v2/ai-image/generation/${succeededJobId}/image`)
                .set('Authorization', `Bearer ${owner.token}`)
                .buffer(true)
                .parse((res, done) => {
                    const chunks: Buffer[] = [];
                    res.on('data', (chunk: Buffer) => chunks.push(chunk));
                    res.on('end', () => done(null, Buffer.concat(chunks)));
                })
                .expect(200);

            expect(response.headers['content-type']).toContain('image/png');
            expect(Buffer.compare(response.body as Buffer, png)).toBe(0);
        });

        it('다른 사용자의 결과는 받을 수 없다', async () => {
            await request(app.getHttpServer())
                .get(`/api/v2/ai-image/generation/${succeededJobId}/image`)
                .set('Authorization', `Bearer ${other.token}`)
                .expect(403);
        });

        it('완성 전 작업은 400', async () => {
            await request(app.getHttpServer())
                .get(`/api/v2/ai-image/generation/${queuedJobId}/image`)
                .set('Authorization', `Bearer ${owner.token}`)
                .expect(400);
        });
    });
});
