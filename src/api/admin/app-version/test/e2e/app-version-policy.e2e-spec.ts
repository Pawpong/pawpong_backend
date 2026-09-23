import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { createTestingApp, getAdminToken } from '../../../../../common/testing/test-utils';
import { NotificationFirebasePushAdapter } from '../../../../service/notification/infrastructure/notification-firebase-push.adapter';

/** 관리자 CRUD와 RN 공개 정책 사이의 강제/선택 업데이트 경계를 검증한다. */
describe('관리자 앱 버전 정책 E2E', () => {
    let app: INestApplication;
    let adminToken: string;
    let id: string;
    const payload = {
        platform: 'android',
        latestVersion: '2.10.0',
        minRequiredVersion: '2.2.0',
        forceUpdateMessage: '필수 업데이트',
        recommendUpdateMessage: '선택 업데이트',
        iosStoreUrl: 'https://apps.apple.com/app/pawpong/id123456789',
        androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
    };
    const auth = () => ({ Authorization: `Bearer ${adminToken}` });
    const check = (currentVersion: string, platform = 'android') =>
        request(app.getHttpServer()).get('/api/v2/app-version/check').query({ platform, currentVersion });
    const update = (body: object) =>
        request(app.getHttpServer()).patch(`/api/app-version-admin/${id}`).set(auth()).send(body);

    beforeAll(async () => {
        app = await createTestingApp([
            { provide: NotificationFirebasePushAdapter, useValue: { sendToTokens: jest.fn() } },
        ]);
        adminToken = (await getAdminToken(app, randomUUID()))!;
        expect(adminToken).toBeTruthy();
        const created = await request(app.getHttpServer())
            .post('/api/app-version-admin')
            .set(auth())
            .send(payload)
            .expect(200);
        id = created.body.data.appVersionId;
    }, 60000);
    afterAll(async () => {
        await app?.close();
    });

    it.each([
        ['2.1.99', true, false, '필수 업데이트'],
        ['2.2.0', false, true, '선택 업데이트'],
        ['2.9.0', false, true, '선택 업데이트'],
        ['2.10.0', false, false, ''],
        ['3.0.0', false, false, ''],
    ])('%s 버전의 강제/선택/최신 정책을 정확히 계산한다', async (version, forced, recommended, message) => {
        const response = await check(version).expect(200);
        expect(response.body.data).toMatchObject({
            needsForceUpdate: forced,
            needsRecommendUpdate: recommended,
            latestVersion: '2.10.0',
            message,
            storeUrl: payload.androidStoreUrl,
        });
    });

    it('다른 플랫폼에는 정책을 적용하지 않는다', async () => {
        const response = await check('0.0.0', 'ios').expect(200);
        expect(response.body.data).toMatchObject({
            needsForceUpdate: false,
            needsRecommendUpdate: false,
            storeUrl: '',
        });
    });

    it('부분 PATCH의 최소/최신 역전과 null을 저장하지 않는다', async () => {
        for (const body of [
            { minRequiredVersion: '3.0.0' },
            { latestVersion: '1.0.0' },
            { minRequiredVersion: null },
            { latestVersion: null },
            { isActive: null },
        ]) {
            await update(body).expect(400);
        }
        const current = await check('2.2.0').expect(200);
        expect(current.body.data).toMatchObject({
            latestVersion: '2.10.0',
            needsRecommendUpdate: true,
            needsForceUpdate: false,
        });
    });

    it('잘못된 플랫폼·버전·스토어 URL·생성 시 역전을 거부한다', async () => {
        for (const version of ['a.b.c', '1', '1.2', '1.2.3-beta', '1.0.-1', '9'.repeat(30) + '.0.0'])
            await check(version).expect(400);
        await check('1.0.0', 'windows').expect(400);
        await request(app.getHttpServer())
            .post('/api/app-version-admin')
            .set(auth())
            .send({ ...payload, minRequiredVersion: '3.0.0' })
            .expect(400);
        for (const body of [
            { iosStoreUrl: '' },
            { androidStoreUrl: '' },
            { iosStoreUrl: 'javascript:alert(1)' },
            { androidStoreUrl: 'https://evil.example' },
            { iosStoreUrl: 'https://apps.apple.com.evil.example/app' },
        ])
            await update(body).expect(400);
    });

    it('기존 DB의 빈 주소나 외부 URL로 사용자를 강제 업데이트에 가두지 않는다', async () => {
        const db = app.get<Connection>(getConnectionToken());
        for (const androidStoreUrl of ['', 'javascript:alert(1)', 'https://evil.example']) {
            await db
                .collection('app_versions')
                .updateOne({ _id: new Types.ObjectId(id) }, { $set: { androidStoreUrl } });
            const result = await check('0.0.0').expect(200);
            expect(result.body.data).toMatchObject({
                needsForceUpdate: false,
                needsRecommendUpdate: false,
                storeUrl: '',
            });
        }
        await db
            .collection('app_versions')
            .updateOne({ _id: new Types.ObjectId(id) }, { $set: { androidStoreUrl: payload.androidStoreUrl } });
    });

    it('정상 부분 수정·비활성화·삭제가 공개 정책에 반영된다', async () => {
        await update({ minRequiredVersion: '2.0.0' }).expect(200);
        expect((await check('2.1.0').expect(200)).body.data.needsRecommendUpdate).toBe(true);
        await update({ isActive: false }).expect(200);
        expect((await check('0.0.0').expect(200)).body.data.needsForceUpdate).toBe(false);
        await update({ isActive: true }).expect(200);
        expect((await check('0.0.0').expect(200)).body.data.needsForceUpdate).toBe(true);
        const listed = await request(app.getHttpServer()).get('/api/app-version-admin').set(auth()).expect(200);
        expect(listed.body.data.items).toEqual(expect.arrayContaining([expect.objectContaining({ appVersionId: id })]));
        await request(app.getHttpServer()).delete(`/api/app-version-admin/${id}`).set(auth()).expect(200);
        expect((await check('0.0.0').expect(200)).body.data.needsForceUpdate).toBe(false);
    });
});
