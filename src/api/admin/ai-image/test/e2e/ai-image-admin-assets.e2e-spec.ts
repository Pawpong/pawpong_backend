import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp, getAdminToken } from '../../../../../common/testing/test-utils';

/**
 * 어드민 애셋 업로드 URL 발급 검증.
 *
 * 이 경로가 없으면 어드민은 썸네일·레퍼런스 파일키를 얻을 방법이 없어
 * 필터를 온전히 등록할 수 없다. 용도별 키 경로가 정확히 갈리는지가 핵심이다.
 */
describe('AI 이미지 어드민 애셋 업로드 (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = (await getAdminToken(app)) || '';
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    it('썸네일 용도는 ai-image/filter 경로 키를 발급한다', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/ai-image-admin/upload-url')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ purpose: 'thumbnail', contentType: 'image/png' })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.objectKey).toMatch(/^ai-image\/filter\/[0-9a-f-]+\.png$/);
        expect(response.body.data.uploadUrl).toBeTruthy();
        expect(response.body.data.expiresInSeconds).toBe(1800);
    });

    it('레퍼런스 용도는 ai-image/reference 경로 키를 발급한다', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/ai-image-admin/upload-url')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ purpose: 'reference', contentType: 'image/jpeg' })
            .expect(200);

        expect(response.body.data.objectKey).toMatch(/^ai-image\/reference\/[0-9a-f-]+\.jpg$/);
    });

    it('미리보기 원본 용도는 사용자 원본과 같은 ai-image/source 경로를 쓴다', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/ai-image-admin/upload-url')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ purpose: 'source', contentType: 'image/webp' })
            .expect(200);

        expect(response.body.data.objectKey).toMatch(/^ai-image\/source\/[0-9a-f-]+\.webp$/);
    });

    it('contentType 미지정 시 image/png 로 발급한다', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/ai-image-admin/upload-url')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ purpose: 'thumbnail' })
            .expect(200);

        expect(response.body.data.objectKey).toMatch(/\.png$/);
    });

    it('발급된 키는 매번 달라 이전 업로드를 덮어쓰지 않는다', async () => {
        const issue = () =>
            request(app.getHttpServer())
                .post('/api/ai-image-admin/upload-url')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ purpose: 'thumbnail', contentType: 'image/png' });

        const [first, second] = await Promise.all([issue(), issue()]);

        expect(first.body.data.objectKey).not.toBe(second.body.data.objectKey);
    });

    it('지원하지 않는 이미지 형식은 400 으로 거부한다', async () => {
        await request(app.getHttpServer())
            .post('/api/ai-image-admin/upload-url')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ purpose: 'thumbnail', contentType: 'image/heic' })
            .expect(400);
    });

    it('허용되지 않은 용도는 400 으로 거부한다', async () => {
        await request(app.getHttpServer())
            .post('/api/ai-image-admin/upload-url')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ purpose: 'result', contentType: 'image/png' })
            .expect(400);
    });

    it('인증 없이 요청하면 401', async () => {
        await request(app.getHttpServer())
            .post('/api/ai-image-admin/upload-url')
            .send({ purpose: 'thumbnail', contentType: 'image/png' })
            .expect(401);
    });
});
