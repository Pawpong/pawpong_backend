import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp, getAdminToken } from '../../../../../common/testing/test-utils';

/**
 * 고아 파일 오분류 방지 검증.
 *
 * 참조 판정은 컬렉션 화이트리스트 방식이라, 새 스키마가 쓰는 파일키를 등록하지 않으면
 * 관리자 화면에서 "미참조 파일"로 분류되어 삭제 대상이 된다.
 */
describe('AI 이미지 파일 참조 판정', () => {
    let app: INestApplication;
    let adminToken: string;
    let thumbnailKey: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = (await getAdminToken(app)) || '';

        thumbnailKey = 'ai-image/filter/thumbnail-reference-test.png';
        await request(app.getHttpServer())
            .post('/api/ai-image-admin/filter')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: '참조 판정 테스트 필터',
                prompt: 'x',
                model: 'gpt-image-1',
                thumbnailFileName: thumbnailKey,
            });
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    it('필터 썸네일 키는 참조됨으로 판정된다 (고아 아님)', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/upload-admin/files/check-references')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ fileKeys: [thumbnailKey] })
            .expect(200);

        const result = response.body.data.files.find((f: { fileKey: string }) => f.fileKey === thumbnailKey);
        expect(result).toBeDefined();
        expect(result.isReferenced).toBe(true);
        expect(result.references.some((ref: { collection: string }) => ref.collection === 'ai_image_filters')).toBe(
            true,
        );
    });

    it('아무도 안 쓰는 키는 그대로 고아로 판정된다', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/upload-admin/files/check-references')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ fileKeys: ['ai-image/source/nobody-uses-this.jpg'] })
            .expect(200);

        expect(response.body.data.files[0].isReferenced).toBe(false);
    });
});
