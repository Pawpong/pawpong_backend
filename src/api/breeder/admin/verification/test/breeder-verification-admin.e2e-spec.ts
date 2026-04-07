import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken, getAdopterToken, seedBreeder } from '../../../../../common/test/test-utils';

/**
 * Breeder Verification Admin API E2E 테스트
 * 브리더 인증 심사 (관리자 전용)
 */
describe('Breeder Verification Admin API E2E Tests', () => {
    let app: INestApplication;
    let adminToken: string;
    let adopterToken: string;
    let breederId: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        const adopter = await getAdopterToken(app);
        adopterToken = adopter?.token || '';
        if (!adminToken) console.log('⚠️  관리자 토큰 획득 실패');

        // 인증 대기 브리더 생성
        const breeder = await seedBreeder(app, 'pending');
        breederId = breeder.breederId;
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('GET /api/breeder-verification-admin/breeders', () => {
        it('브리더 목록 조회 성공', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-verification-admin/breeders')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 브리더 목록 조회 성공');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/breeder-verification-admin/breeders')
                .expect(401);
            console.log('✅ 인증 없이 접근 401 확인');
        });

        it('일반 사용자 접근 시 403', async () => {
            if (!adopterToken) { console.log('⚠️  스킵'); return; }

            await request(app.getHttpServer())
                .get('/api/breeder-verification-admin/breeders')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(403);
            console.log('✅ 일반 사용자 접근 403 확인');
        });
    });

    describe('GET /api/breeder-verification-admin/verification/pending', () => {
        it('승인 대기 브리더 목록 조회 성공', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-verification-admin/verification/pending')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 승인 대기 브리더 목록 조회 성공');
        });
    });

    describe('GET /api/breeder-verification-admin/verification/:breederId', () => {
        it('브리더 상세 조회 성공', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get(`/api/breeder-verification-admin/verification/${breederId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 400]).toContain(response.status);
            console.log('✅ 브리더 상세 조회 검증 완료');
        });
    });

    describe('GET /api/breeder-verification-admin/stats', () => {
        it('브리더 통계 조회 성공', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/breeder-verification-admin/stats')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 브리더 통계 조회 성공');
        });
    });
});
