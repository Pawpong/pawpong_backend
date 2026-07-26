import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AI_IMAGE_PREVIEW_PORT } from '../../application/ports/ai-image-preview.port';
import type { AiImagePreviewPort } from '../../application/ports/ai-image-preview.port';
import { cleanupDatabase, createTestingApp, getAdminToken } from '../../../../../common/testing/test-utils';

/**
 * 어드민 미리보기 엔드포인트 계약 검증.
 *
 * AI Agent 실호출(OpenAI 과금)을 피하기 위해 Port 를 대역으로 교체한다.
 * 여기서 확인하려는 것은 gRPC 응답이 아니라 라우팅·검증·응답 계약이다.
 */
describe('AI 이미지 어드민 미리보기 (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    const previewPortStub: AiImagePreviewPort = {
        generatePreview: jest.fn(),
    };

    beforeAll(async () => {
        app = await createTestingApp([{ provide: AI_IMAGE_PREVIEW_PORT, useValue: previewPortStub }]);
        adminToken = (await getAdminToken(app)) || '';
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('미리보기 성공 결과를 그대로 반환한다', async () => {
        (previewPortStub.generatePreview as jest.Mock).mockResolvedValue({
            isSuccess: true,
            outputObjectKey: 'ai-image/preview/abc.png',
            outputImageUrl: 'https://cdn.test/ai-image/preview/abc.png',
            latencyMs: 8421,
            errorCode: null,
            errorMessage: null,
        });

        const response = await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter/preview')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                prompt: '16-bit pixel art portrait of the pet',
                inputObjectKey: 'ai-image/source/test.jpg',
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isSuccess).toBe(true);
        expect(response.body.data.outputObjectKey).toBe('ai-image/preview/abc.png');
        expect(response.body.data.latencyMs).toBe(8421);
    });

    it('생성 실패는 200 + isSuccess=false 로 내려가고 사유 코드가 보인다', async () => {
        (previewPortStub.generatePreview as jest.Mock).mockResolvedValue({
            isSuccess: false,
            outputObjectKey: null,
            outputImageUrl: null,
            latencyMs: 1200,
            errorCode: 'OPENAI_CALL_FAILED',
            errorMessage: 'rate limit',
        });

        const response = await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter/preview')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ prompt: 'test', inputObjectKey: 'ai-image/source/test.jpg' })
            .expect(200);

        expect(response.body.data.isSuccess).toBe(false);
        expect(response.body.data.errorCode).toBe('OPENAI_CALL_FAILED');
    });

    it('기본값이 채워져 Port 로 전달된다 (미지정 시 pixelate/96/48)', async () => {
        (previewPortStub.generatePreview as jest.Mock).mockResolvedValue({
            isSuccess: true,
            outputObjectKey: 'k',
            outputImageUrl: null,
            latencyMs: 1,
            errorCode: null,
            errorMessage: null,
        });

        await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter/preview')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ prompt: 'p', inputObjectKey: 'k' })
            .expect(200);

        expect(previewPortStub.generatePreview).toHaveBeenCalledWith(
            expect.objectContaining({ postProcessType: 'pixelate', pixelSize: 96, paletteSize: 48 }),
        );
    });

    it('prompt 누락은 400 으로 거부한다', async () => {
        await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter/preview')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ inputObjectKey: 'ai-image/source/test.jpg' })
            .expect(400);

        expect(previewPortStub.generatePreview).not.toHaveBeenCalled();
    });
});
