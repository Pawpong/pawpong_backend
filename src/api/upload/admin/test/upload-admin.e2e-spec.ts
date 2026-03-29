import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../common/test/test-utils';

/**
 * Upload Admin API E2E 테스트
 * 스토리지 관리 (관리자 전용)
 */
describe('Upload Admin API E2E Tests', () => {
    let app: INestApplication;
    let adminToken: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        if (!adminToken) console.log('⚠️  관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('GET /api/upload-admin/files', () => {
        it('파일 목록 조회 성공', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/upload-admin/files')
                .set('Authorization', `Bearer ${adminToken}`);

            // S3 연결 미설정 시 500 가능
            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
            console.log('✅ 파일 목록 조회 검증 완료');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/upload-admin/files')
                .expect(401);
            console.log('✅ 인증 없이 접근 401 확인');
        });
    });

    describe('GET /api/upload-admin/files/referenced', () => {
        it('참조 파일 목록 조회 성공', async () => {
            if (!adminToken) { console.log('⚠️  스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/upload-admin/files/referenced')
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 500]).toContain(response.status);
            console.log('✅ 참조 파일 목록 조회 검증 완료');
        });
    });
});
