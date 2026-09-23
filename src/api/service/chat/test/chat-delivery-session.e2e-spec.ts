import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';

import { createTestingApp, getAdminToken } from '../../../../common/testing/test-utils';
import { AUTH_TOKEN_PORT, AuthTokenPort } from '../../auth/application/ports/auth-token.port';
import { NotificationFirebasePushAdapter } from '../../notification/infrastructure/notification-firebase-push.adapter';
import {
    NOTIFICATION_PUSH_TOKEN_STORE_PORT,
    NotificationPushTokenStorePort,
} from '../../notification/application/ports/notification-push-token-store.port';
import { ChatGateway } from '../chat.gateway';

/** 실제 HTTP·Socket.IO·MongoDB 경계를 함께 검증하며 외부 FCM은 절대 호출하지 않는다. */
describe('채팅 저장 ACK와 계정 접근 폐기 E2E', () => {
    let app: INestApplication;
    let db: Connection;
    let adminToken: string;
    let tokens: AuthTokenPort;
    const clients: Socket[] = [];
    const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

    beforeAll(async () => {
        app = await createTestingApp([
            { provide: NotificationFirebasePushAdapter, useValue: { sendToTokens: jest.fn() } },
        ]);
        db = app.get(getConnectionToken());
        const indexes = await db.collection('chat_messages').indexes();
        expect(indexes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    key: { roomId: 1, senderId: 1, clientMessageId: 1 },
                    unique: true,
                }),
            ]),
        );
        tokens = app.get(AUTH_TOKEN_PORT);
        adminToken = (await getAdminToken(app, randomUUID()))!;
        expect(adminToken).toBeTruthy();
    }, 60000);
    afterEach(() => {
        clients.splice(0).forEach((client) => client.disconnect());
    });
    afterAll(async () => {
        await app?.close();
    });

    async function user(role: 'adopter' | 'breeder' = 'adopter') {
        const id = new Types.ObjectId();
        const issued = tokens.generateTokens(String(id), `${String(id)}@example.test`, role);
        const device = `test-${randomUUID()}`;
        await db.collection(`${role}s`).insertOne({
            _id: id,
            emailAddress: `${String(id)}@example.test`,
            nickname: `user-${String(id)}`,
            name: '테스트',
            userRole: role,
            accountStatus: 'active',
            pushDeviceTokens: [{ token: device }],
            refreshToken: await tokens.hashRefreshToken(issued.refreshToken),
        });
        await db.collection('push_device').insertOne({ token: device, userId: String(id), userRole: role });
        return { id: String(id), role, ...issued, device };
    }

    function send(
        client: Socket,
        payload: object,
    ): Promise<{ success: boolean; messageId?: string; clientMessageId?: string; error?: string }> {
        return client.timeout(5000).emitWithAck('send_message', payload) as Promise<{
            success: boolean;
            messageId?: string;
            clientMessageId?: string;
            error?: string;
        }>;
    }

    async function connect(token: string): Promise<Socket> {
        const client = io(`${await app.getUrl()}/chat`, {
            auth: { token },
            transports: ['websocket'],
            reconnection: false,
        });
        clients.push(client);
        await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('테스트 소켓 연결 시간 초과')), 5000);
            client.once('connect', () => {
                clearTimeout(timer);
                resolve();
            });
            client.once('connect_error', () => {
                clearTimeout(timer);
                reject(new Error('소켓 연결 거부'));
            });
        });
        return client;
    }

    async function room(sender: Awaited<ReturnType<typeof user>>, receiver: Awaited<ReturnType<typeof user>>) {
        const result = await request(app.getHttpServer())
            .post('/api/v2/chat/rooms')
            .set(auth(sender.accessToken))
            .send({ counterpartUserId: receiver.id })
            .expect(200);
        return (result.body as { data: { roomId: string } }).data.roomId;
    }

    it('같은 식별자의 동시 재시도는 저장·unread·전파가 한 번이며 REST에도 식별자가 남는다', async () => {
        const sender = await user();
        const receiver = await user();
        const roomId = await room(sender, receiver);
        const [first, retry, recipient] = await Promise.all([
            connect(sender.accessToken),
            connect(sender.accessToken),
            connect(receiver.accessToken),
        ]);
        await Promise.all(
            [first, retry, recipient].map((client) => client.timeout(5000).emitWithAck('join_room', { roomId })),
        );
        const seen: unknown[] = [];
        recipient.on('new_message', (message) => seen.push(message));
        const payload = { roomId, content: '재전송 테스트', clientMessageId: randomUUID() };
        const acks = await Promise.all([first, retry].map((client) => send(client, payload)));
        expect(acks[0]).toMatchObject({ success: true, clientMessageId: payload.clientMessageId });
        expect(acks[1]).toEqual(acks[0]);
        expect(await db.collection('chat_messages').countDocuments({ roomId })).toBe(1);
        const rooms = await request(app.getHttpServer())
            .get('/api/v2/chat/rooms')
            .set(auth(receiver.accessToken))
            .expect(200);
        expect(
            (rooms.body as { data: Array<{ roomId: string; unreadCount: number }> }).data.find(
                (entry) => entry.roomId === roomId,
            )?.unreadCount,
        ).toBe(1);
        const messages = await request(app.getHttpServer())
            .get(`/api/v2/chat/rooms/${roomId}/messages`)
            .set(auth(receiver.accessToken))
            .expect(200);
        expect((messages.body as { data: unknown }).data).toEqual([
            expect.objectContaining({ messageId: acks[0].messageId, clientMessageId: payload.clientMessageId }),
        ]);
        expect(seen).toHaveLength(1);
        expect(await send(first, { ...payload, content: '다른 내용' })).toMatchObject({ success: false });
        expect(await db.collection('chat_messages').countDocuments({ roomId })).toBe(1);
    });

    it('식별자를 보내지 않는 구버전은 같은 내용도 별도 메시지로 저장한다', async () => {
        const sender = await user();
        const roomId = await room(sender, await user());
        const client = await connect(sender.accessToken);
        const first = await send(client, { roomId, content: '구버전' });
        const second = await send(client, { roomId, content: '구버전' });
        expect(first.success).toBe(true);
        expect(second.success).toBe(true);
        expect(first.messageId).not.toBe(second.messageId);
        expect(await db.collection('chat_messages').countDocuments({ roomId })).toBe(2);
    });

    it.each([
        ['adopter', 'withdraw'],
        ['breeder', 'withdraw'],
        ['adopter', 'suspend'],
        ['breeder', 'suspend'],
        ['breeder', 'breeder-admin'],
    ] as const)('%s %s 처리로 HTTP·refresh·연결·기기 토큰을 함께 폐기한다', async (role, action) => {
        const owner = await user(role);
        const client = await connect(owner.accessToken);
        const disconnected = new Promise<void>((resolve) => client.once('disconnect', () => resolve()));
        if (action === 'withdraw') {
            await request(app.getHttpServer())
                .delete(`/api/v2/${role === 'adopter' ? 'adopter' : 'breeder-management'}/account`)
                .set(auth(owner.accessToken))
                .send({ reason: 'other' })
                .expect(200);
        } else if (action === 'breeder-admin') {
            await request(app.getHttpServer())
                .post(`/api/breeder-admin/suspend/${owner.id}`)
                .set(auth(adminToken))
                .send({ reason: '테스트 정지' })
                .expect(200);
        } else {
            await request(app.getHttpServer())
                .patch(`/api/user-admin/users/${owner.id}/status`)
                .query({ role })
                .set(auth(adminToken))
                .send({ accountStatus: 'suspended', actionReason: '테스트 정지' })
                .expect(200);
        }
        await disconnected;
        await request(app.getHttpServer()).get('/api/v2/chat/rooms').set(auth(owner.accessToken)).expect(401);
        await request(app.getHttpServer())
            .post('/api/v2/auth/refresh')
            .send({ refreshToken: owner.refreshToken })
            .expect(401);
        await expect(connect(owner.accessToken)).rejects.toThrow('소켓 연결 거부');
        const stored = await db.collection(`${role}s`).findOne({ _id: new Types.ObjectId(owner.id) });
        expect(stored?.refreshToken).toBeFalsy();
        expect(stored?.pushDeviceTokens).toEqual([]);
        expect(await db.collection('push_device').countDocuments({ userId: owner.id, userRole: role })).toBe(0);
        // 복구해도 이전 refresh session이 되살아나지 않는다.
        await db
            .collection(`${role}s`)
            .updateOne({ _id: new Types.ObjectId(owner.id) }, { $set: { accountStatus: 'active' } });
        await request(app.getHttpServer())
            .post('/api/v2/auth/refresh')
            .send({ refreshToken: owner.refreshToken })
            .expect(401);
    });

    it('다른 인스턴스에서 정지된 수신자는 다음 전파 전에 연결이 닫히고 기존 푸시 토큰도 조회되지 않는다', async () => {
        const sender = await user();
        const receiver = await user();
        const roomId = await room(sender, receiver);
        const client = await connect(receiver.accessToken);
        await client.timeout(5000).emitWithAck('join_room', { roomId });
        const seen = jest.fn();
        client.on('new_message', seen);
        await db
            .collection('adopters')
            .updateOne({ _id: new Types.ObjectId(receiver.id) }, { $set: { accountStatus: 'suspended' } });
        const disconnected = new Promise<void>((resolve) => client.once('disconnect', () => resolve()));
        await app.get(ChatGateway).broadcastNewMessage({
            messageId: randomUUID(),
            roomId,
            senderId: sender.id,
            senderRole: 'adopter',
            receiverId: receiver.id,
            content: '저장된 메시지',
            messageType: 'text',
            isRead: false,
            createdAt: new Date(),
        });
        await disconnected;
        expect(seen).not.toHaveBeenCalled();
        const store = app.get<NotificationPushTokenStorePort>(NOTIFICATION_PUSH_TOKEN_STORE_PORT);
        expect((await store.findTokensByUser(receiver.id, 'adopter')).tokens).toEqual([]);
        await request(app.getHttpServer())
            .post('/api/v2/auth/refresh')
            .send({ refreshToken: receiver.refreshToken })
            .expect(401);
    });
});
