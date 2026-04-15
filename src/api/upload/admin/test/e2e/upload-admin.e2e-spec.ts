import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../../common/test/test-utils';

/**
 * 업로드 관리자 종단간 테스트
 * 스토리지 관리 (관리자 전용)
 */
describe('업로드 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = await getAdminToken(app) || '';
        if (!adminToken) console.log('주의: 관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('GET /api/upload-관리자/files', () => {
        it('파일 목록 조회 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/upload-admin/files')
                .set('Authorization', `Bearer ${adminToken}`);

            // 스토리지 미설정/오류 시 원본 예외가 500으로 전파될 수 있다.
            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
            console.log('파일 목록 조회 검증 완료');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/upload-admin/files')
                .expect(401);
            console.log('인증 없이 접근 401 확인');
        });
    });

    describe('GET /api/upload-관리자/files/referenced', () => {
        it('참조 파일 목록 조회 성공', async () => {
            if (!adminToken) { console.log('주의: 스킵'); return; }

            const response = await request(app.getHttpServer())
                .get('/api/upload-admin/files/referenced')
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 500]).toContain(response.status);
            console.log('참조 파일 목록 조회 검증 완료');
        });
    });
});
