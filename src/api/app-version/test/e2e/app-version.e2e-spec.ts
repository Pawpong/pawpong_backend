import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { createTestingApp } from '../../../../common/test/test-utils';

/**
 * 앱 버전 체크 종단간 테스트 (공개 API)
 *
 * 테스트 대상:
 * 1. 버전 데이터 없을 때 기본 응답
 * 2. 강제 업데이트 필요 케이스
 * 3. 권장 업데이트 필요 케이스
 * 4. 최신 버전 케이스
 * 5. 유효성 검증
 */
describe('앱 버전 체크 종단간 테스트', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestingApp();

        const connection = app.get<Connection>(getConnectionToken());
        const appVersionsCollection = connection.collection('app_versions');

        await appVersionsCollection.insertOne({
            _id: new ObjectId(),
            platform: 'ios',
            latestVersion: '2.0.0',
            minRequiredVersion: '1.5.0',
            forceUpdateMessage: '필수 보안 업데이트가 있습니다.',
            recommendUpdateMessage: '새로운 기능이 추가되었습니다.',
            iosStoreUrl: 'https://apps.apple.com/app/pawpong/id000000000',
            androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await appVersionsCollection.insertOne({
            _id: new ObjectId(),
            platform: 'android',
            latestVersion: '2.0.0',
            minRequiredVersion: '1.5.0',
            forceUpdateMessage: '필수 보안 업데이트가 있습니다.',
            recommendUpdateMessage: '새로운 기능이 추가되었습니다.',
            iosStoreUrl: 'https://apps.apple.com/app/pawpong/id000000000',
            androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/app-version/check', () => {
        it('iOS - 최신 버전이면 업데이트 불필요 응답', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/app-version/check')
                .query({ platform: 'ios', currentVersion: '2.0.0' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                needsForceUpdate: false,
                needsRecommendUpdate: false,
                latestVersion: '2.0.0',
            });
            console.log('iOS 최신 버전 체크 완료');
        });

        it('iOS - 구버전이면 강제 업데이트 응답', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/app-version/check')
                .query({ platform: 'ios', currentVersion: '1.0.0' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                needsForceUpdate: true,
                needsRecommendUpdate: false,
                latestVersion: '2.0.0',
                message: '필수 보안 업데이트가 있습니다.',
            });
            console.log('iOS 강제 업데이트 케이스 확인');
        });

        it('iOS - 중간 버전이면 권장 업데이트 응답', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/app-version/check')
                .query({ platform: 'ios', currentVersion: '1.5.0' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                needsForceUpdate: false,
                needsRecommendUpdate: true,
                latestVersion: '2.0.0',
                message: '새로운 기능이 추가되었습니다.',
            });
            console.log('iOS 권장 업데이트 케이스 확인');
        });

        it('Android - 버전 체크 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/app-version/check')
                .query({ platform: 'android', currentVersion: '2.0.0' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.needsForceUpdate).toBe(false);
            console.log('Android 버전 체크 완료');
        });

        it('platform 파라미터 없으면 에러', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/app-version/check')
                .query({ currentVersion: '1.0.0' });

            expect([400, 500]).toContain(response.status);
            console.log('platform 누락 에러 확인');
        });

        it('currentVersion 파라미터 없으면 에러', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/app-version/check')
                .query({ platform: 'ios' });

            expect([400, 500]).toContain(response.status);
            console.log('currentVersion 누락 에러 확인');
        });

        it('표준 응답 형식 검증', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/app-version/check')
                .query({ platform: 'ios', currentVersion: '2.0.0' })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('code', 200);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
            console.log('응답 형식 검증 완료');
        });
    });
});
