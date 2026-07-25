import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp, getAdminToken, getAdopterToken } from '../../../../common/testing/test-utils';

/**
 * AI 이미지 사용자 종단간 테스트
 * - 활성 필터 목록 (공개, 프롬프트 미노출)
 * - 원본 업로드 presigned URL 발급
 */
describe('AI 이미지 사용자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let adopterToken: string;
    let activeFilterId: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = (await getAdminToken(app)) || '';
        const adopter = await getAdopterToken(app);
        adopterToken = adopter?.token || '';

        // 활성 필터 1건 + 비활성 필터 1건 준비
        const active = await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: '활성 도트 필터',
                description: '도트 스타일',
                prompt: '비밀 프롬프트 - 노출되면 안 됨',
                model: 'gpt-image-1',
                sortOrder: 1,
            });
        activeFilterId = active.body?.data?.filterId;

        await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: '비활성 필터', prompt: 'x', model: 'gpt-image-1', isActive: false });
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('GET /v2/ai-image/filters — 활성 필터 목록', () => {
        it('비로그인도 조회 가능', async () => {
            const response = await request(app.getHttpServer()).get('/api/v2/ai-image/filters').expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('활성 필터만 노출되고 비활성은 제외된다', async () => {
            const response = await request(app.getHttpServer()).get('/api/v2/ai-image/filters').expect(200);

            const names = response.body.data.map((f: { name: string }) => f.name);
            expect(names).toContain('활성 도트 필터');
            expect(names).not.toContain('비활성 필터');
        });

        it('프롬프트·모델 등 운영 정보가 응답에 없다', async () => {
            const response = await request(app.getHttpServer()).get('/api/v2/ai-image/filters').expect(200);

            const filter = response.body.data.find((f: { filterId: string }) => f.filterId === activeFilterId);
            expect(filter).toBeDefined();
            expect(filter.prompt).toBeUndefined();
            expect(filter.negativePrompt).toBeUndefined();
            expect(filter.model).toBeUndefined();
            expect(filter.referenceImageObjectKeys).toBeUndefined();
        });
    });

    describe('POST /v2/ai-image/upload-url — presigned 업로드 URL', () => {
        it('jpeg 업로드 URL 발급 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v2/ai-image/upload-url')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ contentType: 'image/jpeg' })
                .expect(200);

            expect(response.body.data.uploadUrl).toBeTruthy();
            expect(response.body.data.inputObjectKey).toMatch(/^ai-image\/source\/.+\.jpg$/);
            expect(response.body.data.expiresInSeconds).toBe(600);
        });

        it('png 는 png 확장자 키를 발급한다', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v2/ai-image/upload-url')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ contentType: 'image/png' })
                .expect(200);

            expect(response.body.data.inputObjectKey).toMatch(/\.png$/);
        });

        it('지원하지 않는 형식(HEIC)은 400', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/ai-image/upload-url')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ contentType: 'image/heic' })
                .expect(400);
        });

        it('인증 없이 요청 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/ai-image/upload-url')
                .send({ contentType: 'image/jpeg' })
                .expect(401);
        });
    });
});
