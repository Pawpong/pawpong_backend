import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { AiImageJobStatus } from '../../../../../common/enum/ai-image-job-status.enum';
import { cleanupDatabase, createTestingApp, getAdminToken } from '../../../../../common/testing/test-utils';

/**
 * 어드민 생성 작업 모니터링 검증.
 *
 * 작업은 컬렉션에 직접 시드한다. 이 API 는 조회 엔드포인트라
 * 검증 대상은 필터링·페이지네이션·응답 계약이지 작업이 만들어지는 과정이 아니다.
 * 생성 경로(큐 미연결 시 즉시 FAILED 확정)는 generation e2e 가 이미 실측한다.
 */
describe('AI 이미지 어드민 작업 모니터링 (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    let connection: Connection;

    const filterId = new Types.ObjectId();
    const otherFilterId = new Types.ObjectId();
    const userId = new Types.ObjectId().toString();

    /** 상태·필터만 달리한 최소 작업 도큐먼트 */
    const buildJob = (overrides: Record<string, unknown>) => ({
        userId,
        userRole: 'adopter',
        contestId: null,
        filterId,
        inputObjectKey: 'ai-image/source/seed.jpg',
        outputObjectKey: null,
        status: AiImageJobStatus.FAILED,
        promptSnapshot: '도트 스타일로',
        negativePromptSnapshot: '',
        modelSnapshot: 'gpt-image-1',
        outputSizeSnapshot: '1024x1024',
        attempt: 1,
        errorCode: 'QUEUE_UNAVAILABLE',
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = (await getAdminToken(app)) || '';
        connection = app.get<Connection>(getConnectionToken());

        await connection.collection('ai_image_jobs').insertMany([
            buildJob({}),
            buildJob({}),
            buildJob({
                status: AiImageJobStatus.SUCCEEDED,
                outputObjectKey: 'ai-image/result/seed.png',
                errorCode: null,
            }),
            buildJob({ filterId: otherFilterId, status: AiImageJobStatus.QUEUED, errorCode: null, completedAt: null }),
        ]);
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    it('전체 작업이 페이지네이션 형태로 조회된다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toHaveLength(4);
        expect(response.body.data.pagination.totalItems).toBe(4);
    });

    it('실패한 작업이 사유 코드와 함께 드러난다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .query({ status: AiImageJobStatus.FAILED })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.data.items).toHaveLength(2);
        expect(response.body.data.items[0].status).toBe(AiImageJobStatus.FAILED);
        expect(response.body.data.items[0].errorCode).toBe('QUEUE_UNAVAILABLE');
        expect(response.body.data.items[0].completedAt).not.toBeNull();
    });

    it('어드민 응답에는 프롬프트 스냅샷이 포함된다 (실패 원인 추적용)', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        const job = response.body.data.items[0];
        expect(job.promptSnapshot).toBe('도트 스타일로');
        expect(job.modelSnapshot).toBe('gpt-image-1');
        expect(job.inputObjectKey).toBe('ai-image/source/seed.jpg');
    });

    it('성공 작업은 결과 파일키를 함께 반환한다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .query({ status: AiImageJobStatus.SUCCEEDED })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].outputObjectKey).toBe('ai-image/result/seed.png');
    });

    it('필터 ID 로 좁혀 조회할 수 있다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .query({ filterId: filterId.toString() })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.data.items).toHaveLength(3);
    });

    it('존재하지 않는 필터 ID 로 조회하면 결과가 섞이지 않는다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .query({ filterId: '000000000000000000000000' })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.data.items).toHaveLength(0);
    });

    it('사용자 ID 로 좁혀 조회할 수 있다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .query({ userId })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.data.items).toHaveLength(4);
    });

    it('페이지 크기를 지정하면 그만큼만 내려온다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .query({ page: 1, limit: 2 })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.data.items).toHaveLength(2);
        expect(response.body.data.pagination.totalItems).toBe(4);
        expect(response.body.data.pagination.hasNextPage).toBe(true);
    });

    it('알 수 없는 상태값은 400 으로 거부한다', async () => {
        await request(app.getHttpServer())
            .get('/api/ai-image-admin/jobs')
            .query({ status: 'unknown' })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(400);
    });

    it('인증 없이 조회하면 401', async () => {
        await request(app.getHttpServer()).get('/api/ai-image-admin/jobs').expect(401);
    });
});
