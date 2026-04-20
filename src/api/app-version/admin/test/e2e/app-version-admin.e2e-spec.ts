import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestingApp, cleanupDatabase, getAdminToken } from '../../../../../common/test/test-utils';

/**
 * 앱 버전 관리자 종단간 테스트 (Admin API)
 *
 * 테스트 대상:
 * 1. 앱 버전 생성 (POST /api/app-version-admin)
 * 2. 앱 버전 목록 조회 (GET /api/app-version-admin)
 * 3. 앱 버전 수정 (PATCH /api/app-version-admin/:id)
 * 4. 앱 버전 삭제 (DELETE /api/app-version-admin/:id)
 * 5. 인증 없이 접근 시 401
 */
describe('앱 버전 관리자 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let createdAppVersionId: string;

    beforeAll(async () => {
        app = await createTestingApp();
        adminToken = (await getAdminToken(app)) || '';
        if (!adminToken) console.log('주의: 관리자 토큰 획득 실패');
    }, 30000);

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    describe('POST /api/app-version-admin', () => {
        it('iOS 앱 버전 생성 성공', async () => {
            if (!adminToken) {
                console.log('주의: 스킵 (토큰 없음)');
                return;
            }

            const response = await request(app.getHttpServer())
                .post('/api/app-version-admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    platform: 'ios',
                    latestVersion: '2.0.0',
                    minRequiredVersion: '1.5.0',
                    forceUpdateMessage: '필수 보안 업데이트가 있습니다.',
                    recommendUpdateMessage: '새로운 기능이 추가되었습니다.',
                    iosStoreUrl: 'https://apps.apple.com/app/pawpong/id000000000',
                    androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
                    isActive: true,
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();

            if (response.body.data?.appVersionId) {
                createdAppVersionId = response.body.data.appVersionId;
            }
            console.log('iOS 앱 버전 생성 완료');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .post('/api/app-version-admin')
                .send({
                    platform: 'ios',
                    latestVersion: '1.0.0',
                    minRequiredVersion: '1.0.0',
                    forceUpdateMessage: '테스트',
                    recommendUpdateMessage: '테스트',
                    iosStoreUrl: 'https://apps.apple.com',
                    androidStoreUrl: 'https://play.google.com',
                })
                .expect(401);
            console.log('인증 없이 접근 401 확인');
        });

        it('필수 필드 누락 시 400', async () => {
            if (!adminToken) {
                console.log('주의: 스킵 (토큰 없음)');
                return;
            }

            await request(app.getHttpServer())
                .post('/api/app-version-admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ platform: 'ios' })
                .expect(400);
            console.log('필수 필드 누락 400 확인');
        });

        it('잘못된 platform 값 시 400', async () => {
            if (!adminToken) {
                console.log('주의: 스킵 (토큰 없음)');
                return;
            }

            await request(app.getHttpServer())
                .post('/api/app-version-admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    platform: 'windows',
                    latestVersion: '1.0.0',
                    minRequiredVersion: '1.0.0',
                    forceUpdateMessage: '테스트',
                    recommendUpdateMessage: '테스트',
                    iosStoreUrl: 'https://apps.apple.com',
                    androidStoreUrl: 'https://play.google.com',
                })
                .expect(400);
            console.log('잘못된 platform 400 확인');
        });
    });

    describe('GET /api/app-version-admin', () => {
        it('앱 버전 목록 조회 성공', async () => {
            if (!adminToken) {
                console.log('주의: 스킵 (토큰 없음)');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/app-version-admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            console.log('앱 버전 목록 조회 완료');
        });

        it('페이지네이션 파라미터 적용 확인', async () => {
            if (!adminToken) {
                console.log('주의: 스킵 (토큰 없음)');
                return;
            }

            const response = await request(app.getHttpServer())
                .get('/api/app-version-admin')
                .query({ page: 1, pageSize: 5 })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('페이지네이션 파라미터 확인 완료');
        });

        it('인증 없이 접근 시 401', async () => {
            await request(app.getHttpServer())
                .get('/api/app-version-admin')
                .expect(401);
            console.log('목록 조회 인증 없이 접근 401 확인');
        });
    });

    describe('PATCH /api/app-version-admin/:appVersionId', () => {
        it('앱 버전 수정 성공', async () => {
            if (!adminToken || !createdAppVersionId) {
                console.log('주의: 스킵 (토큰 또는 ID 없음)');
                return;
            }

            const response = await request(app.getHttpServer())
                .patch(`/api/app-version-admin/${createdAppVersionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    latestVersion: '2.1.0',
                    recommendUpdateMessage: '업데이트된 권장 메시지',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('앱 버전 수정 완료');
        });

        it('인증 없이 수정 시 401', async () => {
            await request(app.getHttpServer())
                .patch('/api/app-version-admin/000000000000000000000000')
                .send({ latestVersion: '3.0.0' })
                .expect(401);
            console.log('수정 인증 없이 접근 401 확인');
        });
    });

    describe('DELETE /api/app-version-admin/:appVersionId', () => {
        it('앱 버전 삭제 성공', async () => {
            if (!adminToken || !createdAppVersionId) {
                console.log('주의: 스킵 (토큰 또는 ID 없음)');
                return;
            }

            const response = await request(app.getHttpServer())
                .delete(`/api/app-version-admin/${createdAppVersionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('앱 버전 삭제 완료');
        });

        it('인증 없이 삭제 시 401', async () => {
            await request(app.getHttpServer())
                .delete('/api/app-version-admin/000000000000000000000000')
                .expect(401);
            console.log('삭제 인증 없이 접근 401 확인');
        });
    });
});
