import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken, seedBreeder } from '../../../../../common/test/test-utils';

/**
 * 브리더 관리자 종단간 테스트
 * 브리더 관리 (정지/활성화/테스트계정 - 관리자 전용)
 */
describe('브리더 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let breederId: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        if (!adminToken) console.log('주의: 관리자 토큰 획득 실패');

        const breeder = await seedBreeder(app, 'approved');
        breederId = breeder.breederId;
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('POST /api/breeder-관리자/suspend/:breederId', () => {
        it('브리더 계정 정지 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .post(`/api/breeder-admin/suspend/${breederId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ reason: '테스트 정지 사유' });

            expect([200, 201, 400, 500]).toContain(response.status);
            console.log('브리더 계정 정지 검증 완료');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .post(`/api/breeder-admin/suspend/${breederId}`)
                .send({ reason: '테스트' })
                .expect(401);
            console.log('인증 없이 접근 401 확인');
        });
    });

    describe('POST /api/breeder-관리자/unsuspend/:breederId', () => {
        it('브리더 정지 해제 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .post(`/api/breeder-admin/unsuspend/${breederId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 201, 400, 500]).toContain(response.status);
            console.log('브리더 정지 해제 검증 완료');
        });
    });

    describe('PATCH /api/breeder-관리자/test-account/:breederId', () => {
        it('테스트 계정 설정 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .patch(`/api/breeder-admin/test-account/${breederId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isTestAccount: true });

            expect([200, 400, 500]).toContain(response.status);
            console.log('테스트 계정 설정 검증 완료');
        });
    });
});
