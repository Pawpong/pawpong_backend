import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

import {
    cleanupDatabase,
    createTestingApp,
    getAdopterToken,
    getBreederToken,
} from '../../../../common/testing/test-utils';
import { migrateChatParticipants } from '../../../../scripts/migrate-chat-participants';

describe('Chat API E2E - participant 기반 1:1 DM', () => {
    let app: INestApplication;
    let connection: Connection;
    let adopter1: { token: string; adopterId: string };
    let adopter2: { token: string; adopterId: string };
    let breeder1: { token: string; breederId: string };
    let breeder2: { token: string; breederId: string };

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
        adopter1 = (await getAdopterToken(app))!;
        adopter2 = (await getAdopterToken(app))!;
        breeder1 = (await getBreederToken(app))!;
        breeder2 = (await getBreederToken(app))!;
    });

    afterAll(async () => {
        if (!app) return;
        await cleanupDatabase(app);
        await app.close();
    });

    async function createRoom(token: string, counterpartUserId: string, applicationId?: string) {
        return request(app.getHttpServer())
            .post('/api/v2/chat/rooms')
            .set('Authorization', `Bearer ${token}`)
            .send({ counterpartUserId, applicationId })
            .expect(200);
    }

    describe('방 생성과 단일성', () => {
        it('입양자와 브리더 모두 먼저 DM을 시작할 수 있고 역방향 요청도 같은 방을 반환한다', async () => {
            const first = await createRoom(adopter1.token, breeder1.breederId);
            const reverse = await createRoom(breeder1.token, adopter1.adopterId);

            expect(reverse.body.data.roomId).toBe(first.body.data.roomId);
            expect(first.body.data.counterpart).toEqual(
                expect.objectContaining({ userId: breeder1.breederId, role: 'breeder' }),
            );
            expect(reverse.body.data.counterpart).toEqual(
                expect.objectContaining({ userId: adopter1.adopterId, role: 'adopter' }),
            );

            const stored = await connection.collection('chat_rooms').findOne({
                participantIds: { $all: [adopter1.adopterId, breeder1.breederId] },
            });
            expect(stored).not.toBeNull();
        });

        it('adopter↔adopter와 breeder↔breeder DM도 생성한다', async () => {
            const adopterRoom = await createRoom(adopter1.token, adopter2.adopterId);
            const breederRoom = await createRoom(breeder1.token, breeder2.breederId);

            expect(adopterRoom.body.data.counterpart).toEqual(
                expect.objectContaining({ userId: adopter2.adopterId, role: 'adopter' }),
            );
            expect(breederRoom.body.data.counterpart).toEqual(
                expect.objectContaining({ userId: breeder2.breederId, role: 'breeder' }),
            );
        });

        it('기존 breederId 요청을 호환한다', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${adopter2.token}`)
                .send({ breederId: breeder1.breederId })
                .expect(200);

            expect(response.body.data.counterpart.userId).toBe(breeder1.breederId);
        });

        it('여러 입양 신청은 같은 방의 applicationIds에 누적한다', async () => {
            const first = await createRoom(adopter2.token, breeder2.breederId, 'application-1');
            const second = await createRoom(adopter2.token, breeder2.breederId, 'application-2');

            expect(second.body.data.roomId).toBe(first.body.data.roomId);
            expect(second.body.data.applicationIds).toEqual(expect.arrayContaining(['application-1', 'application-2']));
        });

        it('자기 자신 또는 상대 ID 누락 요청은 400이다', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${adopter1.token}`)
                .send({ counterpartUserId: adopter1.adopterId })
                .expect(400);

            await request(app.getHttpServer())
                .post('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${adopter1.token}`)
                .send({})
                .expect(400);
        });

        it('정지 상대와는 새 대화를 시작하거나 재활성화할 수 없다', async () => {
            await connection
                .collection('breeders')
                .updateOne({ _id: new Types.ObjectId(breeder2.breederId) }, { $set: { accountStatus: 'suspended' } });
            await request(app.getHttpServer())
                .post('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${adopter1.token}`)
                .send({ counterpartUserId: breeder2.breederId })
                .expect(403);

            await connection
                .collection('breeders')
                .updateOne({ _id: new Types.ObjectId(breeder2.breederId) }, { $set: { accountStatus: 'active' } });
        });
    });

    describe('사용자 차단 정책', () => {
        it('차단 중에는 양방향 재활성화를 막고 기록 조회는 유지하며, 해제 후 같은 방을 재사용한다', async () => {
            const roomId = (await createRoom(adopter1.token, breeder1.breederId)).body.data.roomId;

            await request(app.getHttpServer())
                .post(`/api/v2/chat/blocks/${breeder1.breederId}`)
                .set('Authorization', `Bearer ${adopter1.token}`)
                .expect(200);

            await request(app.getHttpServer())
                .post('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${adopter1.token}`)
                .send({ counterpartUserId: breeder1.breederId })
                .expect(403);
            await request(app.getHttpServer())
                .post('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${breeder1.token}`)
                .send({ counterpartUserId: adopter1.adopterId })
                .expect(403);

            await request(app.getHttpServer())
                .get(`/api/v2/chat/rooms/${roomId}/messages`)
                .set('Authorization', `Bearer ${adopter1.token}`)
                .expect(200);

            await request(app.getHttpServer())
                .delete(`/api/v2/chat/blocks/${breeder1.breederId}`)
                .set('Authorization', `Bearer ${adopter1.token}`)
                .expect(200);
            const reopened = await createRoom(breeder1.token, adopter1.adopterId);
            expect(reopened.body.data.roomId).toBe(roomId);
        });
    });

    describe('개인별 숨김과 방 재사용', () => {
        it('DELETE는 요청자에게만 숨기며 재요청하면 같은 roomId가 양쪽에 다시 표시된다', async () => {
            const created = await createRoom(adopter2.token, breeder2.breederId);
            const roomId = created.body.data.roomId as string;

            await request(app.getHttpServer())
                .delete(`/api/v2/chat/rooms/${roomId}`)
                .set('Authorization', `Bearer ${adopter2.token}`)
                .expect(200);

            const [hiddenForAdopter, visibleForBreeder] = await Promise.all([
                request(app.getHttpServer())
                    .get('/api/v2/chat/rooms')
                    .set('Authorization', `Bearer ${adopter2.token}`)
                    .expect(200),
                request(app.getHttpServer())
                    .get('/api/v2/chat/rooms')
                    .set('Authorization', `Bearer ${breeder2.token}`)
                    .expect(200),
            ]);
            expect(hiddenForAdopter.body.data.map((item: any) => item.roomId)).not.toContain(roomId);
            expect(visibleForBreeder.body.data.map((item: any) => item.roomId)).toContain(roomId);

            const reopened = await createRoom(breeder2.token, adopter2.adopterId);
            expect(reopened.body.data.roomId).toBe(roomId);

            const visibleAgain = await request(app.getHttpServer())
                .get('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${adopter2.token}`)
                .expect(200);
            expect(visibleAgain.body.data.map((item: any) => item.roomId)).toContain(roomId);
        });

        it('참여자가 아닌 사용자는 방을 숨길 수 없다', async () => {
            const created = await createRoom(adopter1.token, breeder1.breederId);
            await request(app.getHttpServer())
                .delete(`/api/v2/chat/rooms/${created.body.data.roomId}`)
                .set('Authorization', `Bearer ${adopter2.token}`)
                .expect(403);
        });
    });

    describe('목록, 프로필, 메시지, 읽음 마커', () => {
        let roomId: string;

        beforeAll(async () => {
            roomId = (await createRoom(adopter1.token, breeder1.breederId)).body.data.roomId;
        });

        it('목록 응답은 내부 participantIds를 노출하지 않고 상대 프로필을 조립한다', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${adopter1.token}`)
                .expect(200);
            const room = response.body.data.find((item: any) => item.roomId === roomId);
            expect(room.participantIds).toBeUndefined();
            expect(room.adopterId).toBeUndefined();
            expect(room.breederId).toBeUndefined();
            expect(room.counterpart).toEqual(
                expect.objectContaining({ userId: breeder1.breederId, nickname: expect.any(String) }),
            );
        });

        it('participantStates가 없는 CLOSED legacy 방도 같은 ID로 재활성화한다', async () => {
            const legacyAdopter = (await getAdopterToken(app))!;
            const legacyBreeder = (await getBreederToken(app))!;
            const legacyRoomId = new Types.ObjectId();
            await connection.collection('chat_rooms').insertOne({
                _id: legacyRoomId,
                adopterId: legacyAdopter.adopterId,
                breederId: legacyBreeder.breederId,
                status: 'closed',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const reopened = await createRoom(legacyBreeder.token, legacyAdopter.adopterId);
            expect(reopened.body.data.roomId).toBe(legacyRoomId.toString());
            expect((await connection.collection('chat_rooms').findOne({ _id: legacyRoomId }))?.status).toBe('active');
        });

        it('탈퇴한 상대는 기존 방 목록에서 탈퇴한 사용자로 표시한다', async () => {
            await connection
                .collection('breeders')
                .updateOne({ _id: new Types.ObjectId(breeder1.breederId) }, { $set: { accountStatus: 'deleted' } });
            const response = await request(app.getHttpServer())
                .get('/api/v2/chat/rooms')
                .set('Authorization', `Bearer ${adopter1.token}`)
                .expect(200);
            const room = response.body.data.find((item: any) => item.roomId === roomId);
            expect(room.counterpart.nickname).toBe('탈퇴한 사용자');
            expect(room.counterpart.profileImageUrl).toBeUndefined();

            await connection
                .collection('breeders')
                .updateOne({ _id: new Types.ObjectId(breeder1.breederId) }, { $set: { accountStatus: 'active' } });
        });

        it('메시지를 조회하면 수신 메시지와 participantStates 읽음 마커를 갱신한다', async () => {
            const inserted = await connection.collection('chat_messages').insertOne({
                roomId,
                senderId: breeder1.breederId,
                senderRole: 'breeder',
                receiverId: adopter1.adopterId,
                content: '안녕하세요',
                messageType: 'text',
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const response = await request(app.getHttpServer())
                .get(`/api/v2/chat/rooms/${roomId}/messages`)
                .set('Authorization', `Bearer ${adopter1.token}`)
                .expect(200);
            expect(response.body.data[0]).toEqual(
                expect.objectContaining({ messageId: inserted.insertedId.toString(), isMine: false }),
            );

            const [message, room] = await Promise.all([
                connection.collection('chat_messages').findOne({ _id: inserted.insertedId }),
                connection.collection('chat_rooms').findOne({ _id: new Types.ObjectId(roomId) }),
            ]);
            expect(message?.isRead).toBe(true);
            const state = room?.participantStates.find((item: any) => item.userId === adopter1.adopterId);
            expect(state.lastReadMessageId).toBe(inserted.insertedId.toString());
            expect(state.lastReadAt).toBeInstanceOf(Date);
        });

        it('비참여자는 메시지 조회 403, 없는 방은 404다', async () => {
            await request(app.getHttpServer())
                .get(`/api/v2/chat/rooms/${roomId}/messages`)
                .set('Authorization', `Bearer ${adopter2.token}`)
                .expect(403);
            await request(app.getHttpServer())
                .get('/api/v2/chat/rooms/000000000000000000000000/messages')
                .set('Authorization', `Bearer ${adopter1.token}`)
                .expect(404);
        });
    });

    describe('기존 문서 마이그레이션', () => {
        it('동일 legacy 방들을 하나로 합치고 메시지와 applicationId를 대표 방으로 옮긴다', async () => {
            const legacyAdopterId = new Types.ObjectId().toString();
            const legacyBreederId = new Types.ObjectId().toString();
            const oldClosedRoomId = new Types.ObjectId();
            const activeRoomId = new Types.ObjectId();
            const rooms = connection.collection('chat_rooms');
            const messages = connection.collection('chat_messages');

            await rooms.insertMany([
                {
                    _id: oldClosedRoomId,
                    adopterId: legacyAdopterId,
                    breederId: legacyBreederId,
                    applicationId: 'legacy-application-1',
                    status: 'closed',
                    lastMessage: '예전 메시지',
                    lastMessageAt: new Date('2026-01-01'),
                    createdAt: new Date('2026-01-01'),
                },
                {
                    _id: activeRoomId,
                    adopterId: legacyAdopterId,
                    breederId: legacyBreederId,
                    applicationId: 'legacy-application-2',
                    status: 'active',
                    lastMessage: '최근 메시지',
                    lastMessageAt: new Date('2026-02-01'),
                    createdAt: new Date('2026-02-01'),
                },
            ]);
            await messages.insertMany([
                { roomId: oldClosedRoomId.toString(), content: 'old', createdAt: new Date('2026-01-01') },
                { roomId: activeRoomId.toString(), content: 'new', createdAt: new Date('2026-02-01') },
            ]);

            const summary = await migrateChatParticipants(connection.db!);
            expect(summary.mergedRooms).toBeGreaterThanOrEqual(1);

            const migratedRooms = await rooms
                .find({ participantIds: { $all: [legacyAdopterId, legacyBreederId] } })
                .toArray();
            expect(migratedRooms).toHaveLength(1);
            expect(migratedRooms[0]._id.toString()).toBe(activeRoomId.toString());
            expect(migratedRooms[0].applicationIds).toEqual(
                expect.arrayContaining(['legacy-application-1', 'legacy-application-2']),
            );
            expect(migratedRooms[0].lastMessage).toBe('최근 메시지');
            expect(await messages.countDocuments({ roomId: activeRoomId.toString() })).toBe(2);

            const hiddenAt = new Date('2026-03-01');
            await rooms.updateOne(
                { _id: activeRoomId, 'participantStates.userId': legacyAdopterId },
                { $set: { 'participantStates.$.hiddenAt': hiddenAt } },
            );
            await migrateChatParticipants(connection.db!);
            const rerunRoom = await rooms.findOne({ _id: activeRoomId });
            expect(
                rerunRoom?.participantStates.find((state: any) => state.userId === legacyAdopterId)?.hiddenAt,
            ).toEqual(hiddenAt);
        });
    });
});
