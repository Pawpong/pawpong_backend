import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from '../../../common/test/test-utils';

/**
 * Filter Options API E2E 테스트
 * 모든 엔드포인트가 Public (인증 불필요)
 */
describe('Filter Options API E2E Tests', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestingApp();
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/filter-options', () => {
        it('전체 필터 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('✅ 전체 필터 옵션 조회 성공');
        });
    });

    describe('GET /api/filter-options/breeder-levels', () => {
        it('브리더 레벨 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/breeder-levels')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('✅ 브리더 레벨 옵션 조회 성공');
        });
    });

    describe('GET /api/filter-options/sort-options', () => {
        it('정렬 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/sort-options')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('✅ 정렬 옵션 조회 성공');
        });
    });

    describe('GET /api/filter-options/dog-sizes', () => {
        it('강아지 사이즈 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/dog-sizes')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('✅ 강아지 사이즈 옵션 조회 성공');
        });
    });

    describe('GET /api/filter-options/cat-fur-lengths', () => {
        it('고양이 털 길이 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/cat-fur-lengths')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('✅ 고양이 털 길이 옵션 조회 성공');
        });
    });

    describe('GET /api/filter-options/adoption-status', () => {
        it('입양 상태 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/adoption-status')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            console.log('✅ 입양 상태 옵션 조회 성공');
        });
    });
});
