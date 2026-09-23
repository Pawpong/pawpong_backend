import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { createTestingApp, getAdminToken, seedAdopter, seedBreeder } from '../../../../../common/testing/test-utils';
import { NotificationFirebasePushAdapter } from '../../infrastructure/notification-firebase-push.adapter';
import type { NotificationPushMessage } from '../../application/ports/notification-push.port';

/** 실제 DB와 HTTP 인증을 쓰되, FCM 경계만 대체하여 외부 수신자에게 발송하지 않는다. */
describe('푸시 토큰 소유권·로그아웃·관리자 타기팅', () => {
    let app: INestApplication;
    let db: Connection;
    let adminToken: string;
    let adopterId: string;
    let breederId: string;
    let adopterToken: string;
    let breederToken: string;
    const push = {
        sendToTokens: jest.fn(async (tokens: string[], _message: NotificationPushMessage) =>
            tokens.map((token) => ({ token, success: true, invalidToken: false })),
        ),
    };
    const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
    const register = (token: string, owner: string) =>
        request(app.getHttpServer())
            .post('/api/v2/notification/push-token')
            .set(auth(owner))
            .send({ token, platform: 'android', appVersion: '1.0.0' });
    const dispatch = (target: object, targetUrl = '/l/mobile-share') =>
        request(app.getHttpServer())
            .post('/api/notification-admin/push')
            .set(auth(adminToken))
            .send({ target, title: '격리 테스트', body: '실제 발송하지 않음', targetUrl });

    beforeAll(async () => {
        app = await createTestingApp([{ provide: NotificationFirebasePushAdapter, useValue: push }]);
        db = app.get(getConnectionToken());
        await db.model('PushDevice').init();
        adminToken = (await getAdminToken(app, randomUUID()))!;
        expect(adminToken).toBeTruthy();
        adopterId = (await seedAdopter(app)).adopterId;
        breederId = (await seedBreeder(app)).breederId;
        for (const [collection, id] of [
            ['adopters', adopterId],
            ['breeders', breederId],
        ]) {
            await db
                .collection(collection)
                .updateOne(
                    { _id: new Types.ObjectId(id) },
                    { $set: { accountStatus: 'active', pushDeviceTokens: [] } },
                );
        }
        const jwt = app.get(JwtService);
        adopterToken = jwt.sign({ sub: adopterId, role: 'adopter' });
        breederToken = jwt.sign({ sub: breederId, role: 'breeder' });
    }, 60000);
    afterAll(async () => {
        await app?.close();
    });
    beforeEach(async () => {
        push.sendToTokens.mockClear();
        push.sendToTokens.mockImplementation(async (tokens) =>
            tokens.map((token) => ({ token, success: true, invalidToken: false })),
        );
        await db.collection('push_device').deleteMany({});
        await db.collection('notifications').deleteMany({});
        await db.collection('adopters').updateMany({}, { $set: { pushDeviceTokens: [], accountStatus: 'active' } });
        await db.collection('breeders').updateMany({}, { $set: { pushDeviceTokens: [], accountStatus: 'active' } });
    });

    it('익명 기기 재등록은 중복 환영 푸시를 발송하지 않는다', async () => {
        for (let i = 0; i < 2; i++)
            await request(app.getHttpServer())
                .post('/api/v2/notification/device-token')
                .send({ token: 'owned-fixture-anonymous', platform: 'ios' })
                .expect(200);
        expect(push.sendToTokens).toHaveBeenCalledTimes(1);
        expect(await db.collection('push_device').countDocuments()).toBe(1);
    });

    it('인증 없는 계정 등록·해제와 공백 토큰을 거부한다', async () => {
        await request(app.getHttpServer())
            .post('/api/v2/notification/push-token')
            .send({ token: 'owned-fixture' })
            .expect(401);
        await request(app.getHttpServer())
            .delete('/api/v2/notification/push-token')
            .send({ token: 'owned-fixture' })
            .expect(401);
        await register('   ', adopterToken).expect(400);
        await register('owned-fixture', adminToken).expect(400);
    });

    it('같은 계정 동시 등록도 한 토큰만 저장한다', async () => {
        const results = await Promise.all(
            Array.from({ length: 5 }, () => register('owned-fixture-concurrent', adopterToken)),
        );
        expect(results.map((r) => r.status)).toEqual([200, 200, 200, 200, 200]);
        const owner = await db.collection('adopters').findOne({ _id: new Types.ObjectId(adopterId) });
        expect(owner!.pushDeviceTokens).toHaveLength(1);
        expect(await db.collection('push_device').countDocuments()).toBe(1);
    });

    it('두 역할의 동시 등록도 최종 소유자 한 명만 남긴다', async () => {
        const results = await Promise.all([
            register('owned-fixture-handoff-race', adopterToken),
            register('owned-fixture-handoff-race', breederToken),
        ]);
        expect(results.map((r) => r.status)).toEqual([200, 200]);
        const adopterCount = await db
            .collection('adopters')
            .countDocuments({ 'pushDeviceTokens.token': 'owned-fixture-handoff-race' });
        const breederCount = await db
            .collection('breeders')
            .countDocuments({ 'pushDeviceTokens.token': 'owned-fixture-handoff-race' });
        expect(adopterCount + breederCount).toBe(1);
        const device = await db.collection('push_device').findOne({ token: 'owned-fixture-handoff-race' });
        expect(device!.userId).toBe(adopterCount ? adopterId : breederId);
    });

    it('이전 계정 로그아웃은 새 소유자를 유지하고 현재 계정 로그아웃은 개별 푸시를 차단한다', async () => {
        const token = 'owned-fixture-handoff';
        await register(token, adopterToken).expect(200);
        await register(token, breederToken).expect(200);
        await request(app.getHttpServer())
            .delete('/api/v2/notification/push-token')
            .set(auth(adopterToken))
            .send({ token })
            .expect(200);
        expect((await db.collection('push_device').findOne({ token }))!.userId).toBe(breederId);
        const previous = await dispatch({ type: 'individual', role: 'adopter', userId: adopterId }).expect(200);
        expect(previous.body.data.pushTokensTargeted).toBe(0);
        const current = await dispatch(
            { type: 'individual', role: 'breeder', userId: breederId },
            'https://pawpong.kr/l/mobile-share',
        ).expect(200);
        expect(current.body.data).toMatchObject({ recipients: 1, pushTokensTargeted: 1, pushSuccess: 1 });
        expect(push.sendToTokens).toHaveBeenLastCalledWith(
            [token],
            expect.objectContaining({ targetUrl: 'https://pawpong.kr/l/mobile-share' }),
        );
        await request(app.getHttpServer())
            .delete('/api/v2/notification/push-token')
            .set(auth(breederToken))
            .send({ token })
            .expect(200);
        expect((await db.collection('push_device').findOne({ token }))!.userId).toBeNull();
        const loggedOut = await dispatch({ type: 'individual', role: 'breeder', userId: breederId }).expect(200);
        expect(loggedOut.body.data.pushTokensTargeted).toBe(0);
    });

    it('입양자/브리더 전체 대상은 활성 계정만 선택하고 중복 토큰은 한 번만 발송한다', async () => {
        await register('owned-adopter', adopterToken).expect(200);
        await register('owned-breeder', breederToken).expect(200);
        await db
            .collection('adopters')
            .updateOne(
                { _id: new Types.ObjectId(adopterId) },
                { $set: { pushDeviceTokens: [{ token: 'owned-adopter' }, { token: 'owned-adopter' }] } },
            );
        const adopters = await dispatch({ type: 'all_adopters' }).expect(200);
        expect(adopters.body.data.pushTokensTargeted).toBe(1);
        expect(push.sendToTokens).toHaveBeenLastCalledWith(
            ['owned-adopter'],
            expect.objectContaining({ targetUrl: '/l/mobile-share' }),
        );
        await dispatch({ type: 'all_breeders' }).expect(200);
        expect(push.sendToTokens).toHaveBeenLastCalledWith(['owned-breeder'], expect.anything());
        await db
            .collection('breeders')
            .updateOne({ _id: new Types.ObjectId(breederId) }, { $set: { accountStatus: 'suspended' } });
        const excluded = await dispatch({ type: 'all_breeders' }).expect(200);
        expect(excluded.body.data.pushTokensTargeted).toBe(0);
    });

    it('FCM 무효 토큰은 계정과 기기 저장소에서 정리한다', async () => {
        await register('owned-invalid', adopterToken).expect(200);
        push.sendToTokens.mockImplementationOnce(async (tokens) =>
            tokens.map((token) => ({ token, success: false, invalidToken: true })),
        );
        const result = await dispatch({ type: 'individual', role: 'adopter', userId: adopterId }).expect(200);
        expect(result.body.data).toMatchObject({ pushFailed: 1, invalidTokens: 1 });
        expect(await db.collection('push_device').countDocuments({ token: 'owned-invalid' })).toBe(0);
        expect(
            (await db.collection('adopters').findOne({ _id: new Types.ObjectId(adopterId) }))!.pushDeviceTokens,
        ).toHaveLength(0);
    });

    it('관리자 권한·대상 필수값·위험 URL을 검사하고 발송하지 않는다', async () => {
        await request(app.getHttpServer()).post('/api/notification-admin/push').send({}).expect(401);
        await request(app.getHttpServer())
            .post('/api/notification-admin/push')
            .set(auth(adopterToken))
            .send({})
            .expect(403);
        for (const target of [
            undefined,
            null,
            {},
            { type: 'individual' },
            { type: 'individual', role: 'adopter', userId: 'bad-id' },
        ]) {
            await request(app.getHttpServer())
                .post('/api/notification-admin/push')
                .set(auth(adminToken))
                .send({ title: '테스트', body: '테스트', target })
                .expect(400);
        }
        for (const url of [
            'javascript:alert(1)',
            '//evil.example',
            'https://evil.example/l/test',
            'https://pawpong.kr.evil.example/l/test',
            '/api/auth',
            '/home/../api/auth',
            'https://pawpong.kr/l/test?next=evil',
        ]) {
            await dispatch({ type: 'individual', role: 'adopter', userId: adopterId }, url).expect(400);
        }
        expect(push.sendToTokens).not.toHaveBeenCalled();
    });
});
