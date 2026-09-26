import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import {
    cleanupDatabase,
    createTestingApp,
    getAdminToken,
    getAdopterToken,
} from '../../../../../common/testing/test-utils';

/**
 * AI 이미지 관리자 종단간 테스트 — AI 필터 CRUD
 */
describe('AI 이미지 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let adopterToken: string;
    let createdFilterId: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = (await getAdminToken(app)) || '';
        const adopter = await getAdopterToken(app);
        adopterToken = adopter?.token || '';
        if (!adminToken) console.log('주의: 관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('AI 필터 CRUD', () => {
        it('필터 생성', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/ai-image-admin/filter')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: '포근한 버섯 상점',
                    description: '반려동물을 버섯 가게 주인으로',
                    prompt: '반려동물을 버섯 가게 주인으로 표현한 도트 일러스트',
                    model: 'gpt-image-1',
                    sortOrder: 1,
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('포근한 버섯 상점');
            expect(response.body.data.isActive).toBe(true);
            // 포퐁 도트 콘셉트 — 설정을 주지 않으면 도트 후처리·원본 보존 high 로 저장된다
            expect(response.body.data.postProcessType).toBe('pixelate');
            expect(response.body.data.pixelSize).toBe(96);
            expect(response.body.data.paletteSize).toBe(48);
            expect(response.body.data.inputFidelity).toBe('high');
            createdFilterId = response.body.data.filterId;
        });

        it('전체 필터 목록 조회 — 생성한 필터가 포함된다', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/ai-image-admin/filters')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.some((f: { filterId: string }) => f.filterId === createdFilterId)).toBe(true);
        });

        it('필터 수정 — 프롬프트·활성 여부 변경', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/api/ai-image-admin/filter/${createdFilterId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ prompt: '수정된 프롬프트', isActive: false })
                .expect(200);

            expect(response.body.data.prompt).toBe('수정된 프롬프트');
            expect(response.body.data.isActive).toBe(false);
        });

        it('필터 수정 — 도트 설정 변경', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/api/ai-image-admin/filter/${createdFilterId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ postProcessType: 'pixelate', pixelSize: 64, paletteSize: 16, inputFidelity: 'low' })
                .expect(200);

            expect(response.body.data.pixelSize).toBe(64);
            expect(response.body.data.paletteSize).toBe(16);
            expect(response.body.data.inputFidelity).toBe('low');
        });

        it('도트 해상도 범위를 벗어나면 400', async () => {
            await request(app.getHttpServer())
                .patch(`/api/ai-image-admin/filter/${createdFilterId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ pixelSize: 4 })
                .expect(400);
        });

        it('잘못된 필터 ID 형식으로 수정 시 400', async () => {
            await request(app.getHttpServer())
                .patch('/api/ai-image-admin/filter/invalid-filter-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ prompt: 'x' })
                .expect(400);
        });

        it('존재하지 않는 필터 수정 시 400', async () => {
            await request(app.getHttpServer())
                .patch('/api/ai-image-admin/filter/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ prompt: 'x' })
                .expect(400);
        });

        it('필수 필드 누락 시 400', async () => {
            await request(app.getHttpServer())
                .post('/api/ai-image-admin/filter')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: '이름만 있음' })
                .expect(400);
        });

        it('필터 삭제', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/api/ai-image-admin/filter/${createdFilterId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data.deleted).toBe(true);
        });

        it('삭제된 필터 재삭제 시 400', async () => {
            await request(app.getHttpServer())
                .delete(`/api/ai-image-admin/filter/${createdFilterId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);
        });
    });

    describe('권한', () => {
        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer()).get('/api/ai-image-admin/filters').expect(401);
        });

        it('입양자 토큰으로 접근 시 403', async () => {
            await request(app.getHttpServer())
                .get('/api/ai-image-admin/filters')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(403);
        });
    });
});
