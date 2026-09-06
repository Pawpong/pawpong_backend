import { WsException } from '@nestjs/websockets';

import { ChatGateway } from '../chat.gateway';
import { ChatPolicyService } from '../domain/services/chat-policy.service';
import { ChatRoomStatus } from '../../../../schema/chat-room.schema';
import { MessageType, SenderRole } from '../../../../schema/chat-message.schema';
import { UserStatus } from '../../../../common/enum/user.enum';
import { KafkaConsumerStatus } from '../../../../common/kafka/kafka-consumer-status';

const room = {
    id: 'room-1',
    participantIds: ['user-1', 'user-2'],
    participants: [
        { userId: 'user-1', role: SenderRole.ADOPTER },
        { userId: 'user-2', role: SenderRole.BREEDER },
    ],
    participantKey: 'user-1:user-2',
    participantStates: [{ userId: 'user-1' }, { userId: 'user-2' }],
    applicationIds: [],
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
};

const message = {
    id: 'message-1',
    roomId: 'room-1',
    senderId: 'user-1',
    senderRole: SenderRole.ADOPTER,
    receiverId: 'user-2',
    content: '안녕',
    messageType: MessageType.TEXT,
    isRead: false,
    createdAt: new Date('2026-08-31T00:00:00.000Z'),
};

function makeClient() {
    return {
        id: 'socket-1',
        data: {},
        handshake: { auth: { token: 'jwt' }, query: {}, headers: {} },
        disconnect: jest.fn(),
        join: jest.fn().mockResolvedValue(undefined),
        leave: jest.fn(),
        emit: jest.fn(),
    } as any;
}

function makeGateway(
    options: {
        roomResult?: any;
        payload?: any;
        accountStatus?: UserStatus;
        brokerPublished?: boolean;
        consumerReady?: boolean;
        findParticipant?: jest.Mock;
    } = {},
) {
    const {
        roomResult = room,
        payload = { sub: 'user-1', role: 'adopter' },
        accountStatus = UserStatus.ACTIVE,
        brokerPublished = true,
        consumerReady = true,
    } = options;

    const roomManager = {
        findRoomById: jest.fn().mockResolvedValue(roomResult),
    } as any;
    const sendMessageUseCase = {
        execute: jest.fn().mockResolvedValue({ ...message, brokerPublished }),
    };
    const mapper = {
        toBroadcastPayload: jest.fn().mockReturnValue({ ...message, messageId: message.id }),
    };
    const findParticipant =
        options.findParticipant ??
        jest.fn().mockResolvedValue({
            userId: payload.sub,
            role: payload.role,
            accountStatus,
        });
    const kafkaConsumerStatus = new KafkaConsumerStatus();
    if (consumerReady) kafkaConsumerStatus.markReady();

    const gateway = new ChatGateway(
        sendMessageUseCase as any,
        { execute: jest.fn() } as any,
        roomManager,
        { findParticipant } as any,
        new ChatPolicyService(),
        mapper as any,
        { verify: jest.fn().mockReturnValue(payload) } as any,
        { get: jest.fn().mockReturnValue('secret') } as any,
        kafkaConsumerStatus,
        { logSuccess: jest.fn() } as any,
    );

    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    gateway.server = { to } as any;

    return { gateway, roomManager, sendMessageUseCase, mapper, findParticipant, kafkaConsumerStatus, to, emit };
}

/**
 * Socket.IO 의 실제 연결 순서를 흉내낸다.
 *
 * 1. afterInit 에서 등록한 미들웨어가 먼저 끝나야 연결이 성립한다.
 * 2. Socket.IO 는 handleConnection 이 돌려주는 Promise 를 기다리지 않고
 *    곧바로 클라이언트 이벤트를 디스패치한다. 그래서 여기서도 await 하지 않는다.
 *
 * 반환된 error 가 있으면 미들웨어가 연결을 거절한 것이다.
 */
async function simulateConnect(gateway: ChatGateway, client: any): Promise<Error | undefined> {
    const middlewares: Array<(socket: any, next: (error?: Error) => void) => void> = [];
    gateway.afterInit({ use: (middleware: any) => middlewares.push(middleware) } as any);

    for (const middleware of middlewares) {
        const error = await new Promise<Error | undefined>((resolve) => middleware(client, resolve));
        if (error) return error;
    }

    void gateway.handleConnection(client);
    return undefined;
}

describe('ChatGateway', () => {
    it('connect 직후 즉시 join_room 해도 성공한다', async () => {
        // 연결 성립 전에 인증이 끝나야 하므로, 참여자 조회가 느려도 join_room 이 거절되면 안 된다.
        const findParticipant = jest
            .fn()
            .mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () => resolve({ userId: 'user-1', role: 'adopter', accountStatus: UserStatus.ACTIVE }),
                            20,
                        ),
                    ),
            );
        const { gateway, roomManager } = makeGateway({ findParticipant });
        const client = makeClient();

        const rejection = await simulateConnect(gateway, client);

        // handleConnection 을 기다리지 않고 곧바로 emit 하는 프론트엔드와 동일한 순서
        await gateway.handleJoinRoom(client, { roomId: 'room-1' });

        expect(rejection).toBeUndefined();
        expect(roomManager.findRoomById).toHaveBeenCalledWith('room-1');
        expect(client.join).toHaveBeenCalledWith('room-1');
    });

    it('참여자 조회가 끝나기 전에는 연결을 성립시키지 않는다', async () => {
        let resolveParticipant: (value: unknown) => void = () => undefined;
        const findParticipant = jest.fn().mockReturnValue(new Promise((resolve) => (resolveParticipant = resolve)));
        const { gateway } = makeGateway({ findParticipant });
        const client = makeClient();

        const middlewares: Array<(socket: any, next: (error?: Error) => void) => void> = [];
        gateway.afterInit({ use: (middleware: any) => middlewares.push(middleware) } as any);

        const next = jest.fn();
        middlewares[0](client, next);
        await Promise.resolve();

        expect(next).not.toHaveBeenCalled();
        expect(client.data.user).toBeUndefined();

        resolveParticipant({ userId: 'user-1', role: 'adopter', accountStatus: UserStatus.ACTIVE });
        await new Promise((resolve) => setImmediate(resolve));

        expect(next).toHaveBeenCalledWith();
        expect(client.data.user).toEqual({ userId: 'user-1', role: SenderRole.ADOPTER });
    });

    it('JWT는 유효해도 채팅방 비참여자는 join_room을 거부한다', async () => {
        const { gateway } = makeGateway({ payload: { sub: 'outsider', role: 'adopter' } });
        const client = makeClient();
        await simulateConnect(gateway, client);
        await expect(gateway.handleJoinRoom(client, { roomId: 'room-1' })).rejects.toBeInstanceOf(WsException);
        expect(client.join).not.toHaveBeenCalled();
    });

    it('지원하지 않는 역할의 JWT는 연결 자체를 거절한다', async () => {
        const { gateway } = makeGateway({ payload: { sub: 'admin-1', role: 'admin' } });
        const client = makeClient();

        const rejection = await simulateConnect(gateway, client);

        expect(rejection).toBeInstanceOf(Error);
        await expect(gateway.handleJoinRoom(client, { roomId: 'room-1' })).rejects.toBeInstanceOf(WsException);
    });

    it('토큰이 없으면 연결 자체를 거절한다', async () => {
        const { gateway } = makeGateway();
        const client = makeClient();
        client.handshake = { auth: {}, query: {}, headers: {} };

        const rejection = await simulateConnect(gateway, client);

        expect(rejection).toBeInstanceOf(Error);
        expect(client.data.user).toBeUndefined();
    });

    it('탈퇴 계정의 유효기간이 남은 JWT도 Socket 연결 단계에서 거부한다', async () => {
        const { gateway } = makeGateway({ accountStatus: UserStatus.DELETED });
        const client = makeClient();

        const rejection = await simulateConnect(gateway, client);

        expect(rejection).toBeInstanceOf(Error);
        expect(client.data.user).toBeUndefined();
    });

    it('Kafka 발행 실패 시 현재 인스턴스에 새 메시지를 직접 전파한다', async () => {
        const { gateway, mapper, to, emit } = makeGateway({ brokerPublished: false });
        const client = makeClient();
        await simulateConnect(gateway, client);

        await gateway.handleSendMessage(client, {
            roomId: 'room-1',
            content: '안녕',
            messageType: MessageType.TEXT,
        });

        expect(mapper.toBroadcastPayload).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'message-1', brokerPublished: false }),
        );
        expect(to).toHaveBeenCalledWith('room-1');
        expect(emit).toHaveBeenCalledWith('new_message', expect.objectContaining({ messageId: 'message-1' }));
    });

    it('Kafka 발행 성공 시 consumer의 전파를 기다려 중복 emit하지 않는다', async () => {
        const { gateway, mapper, to } = makeGateway({ brokerPublished: true, consumerReady: true });
        const client = makeClient();
        await simulateConnect(gateway, client);

        await gateway.handleSendMessage(client, {
            roomId: 'room-1',
            content: '안녕',
            messageType: MessageType.TEXT,
        });

        expect(mapper.toBroadcastPayload).not.toHaveBeenCalled();
        expect(to).not.toHaveBeenCalled();
    });

    it('발행에 성공해도 consumer가 아직 준비되지 않았으면 직접 전파한다', async () => {
        // 부팅 직후 producer 만 붙어 있는 구간: 아무도 소비하지 않으므로 로컬 broadcast 가 필요하다.
        const { gateway, to, emit } = makeGateway({ brokerPublished: true, consumerReady: false });
        const client = makeClient();
        await simulateConnect(gateway, client);

        await gateway.handleSendMessage(client, {
            roomId: 'room-1',
            content: '안녕',
            messageType: MessageType.TEXT,
        });

        expect(to).toHaveBeenCalledWith('room-1');
        expect(emit).toHaveBeenCalledWith('new_message', expect.objectContaining({ messageId: 'message-1' }));
    });

    it('consumer가 뒤늦게 같은 메시지를 전달해도 중복 전파하지 않는다', async () => {
        const { gateway, to, emit } = makeGateway({ brokerPublished: true, consumerReady: false });
        const client = makeClient();
        await simulateConnect(gateway, client);

        await gateway.handleSendMessage(client, {
            roomId: 'room-1',
            content: '안녕',
            messageType: MessageType.TEXT,
        });

        // consumer 가 합류한 뒤 같은 offset 을 다시 읽어 broadcast 를 시도하는 상황
        gateway.broadcastNewMessage({ ...message, messageId: message.id });

        expect(to).toHaveBeenCalledTimes(1);
        expect(emit).toHaveBeenCalledTimes(1);
    });
});
