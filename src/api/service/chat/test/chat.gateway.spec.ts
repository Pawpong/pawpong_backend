import { WsException } from '@nestjs/websockets';

import { ChatGateway } from '../chat.gateway';
import { AccountWriteFenceService } from '../../../../common/account-write-fence/account-write-fence.service';
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
    } as unknown as jest.Mocked<Parameters<ChatGateway['handleSendMessage']>[0]>;
}

function makeGateway(
    options: {
        roomResult?: any;
        payload?: any;
        accountStatus?: UserStatus;
        brokerPublished?: boolean;
        consumerReady?: boolean;
        findParticipant?: jest.Mock;
        runWithLease?: jest.Mock;
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
    };
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
    const verify = jest.fn().mockReturnValue(payload);

    const writeFence = {
        runWithLease: options.runWithLease ?? jest.fn((_actor: unknown, run: () => Promise<unknown>) => run()),
    };
    const gateway = new ChatGateway(
        sendMessageUseCase as any,
        { execute: jest.fn() } as any,
        roomManager as unknown as ConstructorParameters<typeof ChatGateway>[2],
        { findParticipant } as any,
        new ChatPolicyService(),
        mapper as any,
        { verify } as any,
        { get: jest.fn().mockReturnValue('secret') } as any,
        kafkaConsumerStatus,
        { logSuccess: jest.fn() } as any,
        writeFence as unknown as AccountWriteFenceService,
    );

    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    gateway.server = { to, sockets: new Map() } as any;

    return {
        gateway,
        roomManager,
        sendMessageUseCase,
        mapper,
        findParticipant,
        kafkaConsumerStatus,
        writeFence,
        to,
        emit,
        verify,
    };
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
    it('rejects a send before the message use case when deletion has locked the account', async () => {
        const { gateway, sendMessageUseCase, writeFence } = makeGateway({
            runWithLease: jest.fn().mockRejectedValue(new Error('account write blocked')),
        });
        const client = makeClient();
        await simulateConnect(gateway, client);
        await gateway.handleSendMessage(client, {
            roomId: 'room-1',
            content: 'no write',
            messageType: MessageType.TEXT,
        });
        expect(writeFence.runWithLease).toHaveBeenCalledWith(
            { accountId: 'user-1', role: SenderRole.ADOPTER, operation: 'websocket:send_message' },
            expect.any(Function),
        );
        expect(sendMessageUseCase.execute).not.toHaveBeenCalled();
        expect(client.emit).toHaveBeenCalledWith('error', { message: 'account write blocked' });
    });

    it('does not finish the websocket lease until message persistence and broadcast have finished', async () => {
        let finish!: (value: unknown) => void;
        let started!: () => void;
        const persistenceStarted = new Promise<void>((resolve) => {
            started = resolve;
        });
        const released = jest.fn();
        const runWithLease = jest.fn(async (_actor: unknown, run: () => Promise<unknown>) => {
            try {
                return await run();
            } finally {
                released();
            }
        });
        const { gateway, sendMessageUseCase, emit } = makeGateway({ runWithLease, brokerPublished: false });
        sendMessageUseCase.execute.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                    started();
                }),
        );
        const client = makeClient();
        await simulateConnect(gateway, client);
        const pending = gateway.handleSendMessage(client, {
            roomId: 'room-1',
            content: 'persist',
            messageType: MessageType.TEXT,
        });
        await persistenceStarted;
        expect(released).not.toHaveBeenCalled();
        finish({ ...message, brokerPublished: false });
        await pending;
        expect(emit).toHaveBeenCalledWith('new_message', expect.any(Object));
        expect(released).toHaveBeenCalledTimes(1);
        expect(emit.mock.invocationCallOrder[0]).toBeLessThan(released.mock.invocationCallOrder[0]);
    });

    it('keeps the lease until asynchronous socket reauthentication and fallback broadcast finish', async () => {
        let finishBroadcast!: () => void;
        let started!: () => void;
        const broadcastStarted = new Promise<void>((resolve) => {
            started = resolve;
        });
        const released = jest.fn();
        const runWithLease = jest.fn(async (_actor: unknown, run: () => Promise<unknown>) => {
            try {
                return await run();
            } finally {
                released();
            }
        });
        const { gateway } = makeGateway({ runWithLease, brokerPublished: false });
        jest.spyOn(gateway, 'broadcastNewMessage').mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    finishBroadcast = resolve;
                    started();
                }),
        );
        const client = makeClient();
        await simulateConnect(gateway, client);
        const pending = gateway.handleSendMessage(client, { roomId: 'room-1', content: '안녕' });
        await broadcastStarted;
        expect(released).not.toHaveBeenCalled();
        finishBroadcast();
        await expect(pending).resolves.toEqual({ success: true, messageId: 'message-1' });
        expect(released).toHaveBeenCalledTimes(1);
    });

    it('returns the original clientMessageId ACK inside the fence without broadcasting duplicate retries', async () => {
        const { gateway, sendMessageUseCase, writeFence, emit } = makeGateway({ brokerPublished: false });
        sendMessageUseCase.execute.mockResolvedValueOnce({
            ...message,
            clientMessageId: 'retry-1',
            brokerPublished: false,
            isDuplicate: true,
        } as any);
        const client = makeClient();
        await simulateConnect(gateway, client);
        await expect(
            gateway.handleSendMessage(client, {
                roomId: 'room-1',
                content: '안녕',
                clientMessageId: 'retry-1',
            }),
        ).resolves.toEqual({ success: true, messageId: 'message-1', clientMessageId: 'retry-1' });
        expect(writeFence.runWithLease).toHaveBeenCalledTimes(1);
        expect(sendMessageUseCase.execute).toHaveBeenCalledWith(
            'user-1',
            SenderRole.ADOPTER,
            expect.objectContaining({ clientMessageId: 'retry-1' }),
        );
        expect(emit).not.toHaveBeenCalled();
    });

    it('also fences websocket read-state mutations after account deletion', async () => {
        const { gateway, writeFence, emit } = makeGateway({
            runWithLease: jest.fn().mockRejectedValue(new Error('account write blocked')),
        });
        const client = makeClient();
        await simulateConnect(gateway, client);
        await gateway.handleReadMessages(client, { roomId: 'room-1' });
        expect(writeFence.runWithLease).toHaveBeenCalledWith(
            { accountId: 'user-1', role: SenderRole.ADOPTER, operation: 'websocket:read_messages' },
            expect.any(Function),
        );
        expect(emit).not.toHaveBeenCalled();
    });

    it.each([UserStatus.DELETED, UserStatus.SUSPENDED, null])(
        'rechecks an existing socket before joining when the account becomes %s',
        async (status) => {
            const { gateway, findParticipant, roomManager } = makeGateway();
            const client = makeClient();
            await simulateConnect(gateway, client);
            findParticipant.mockResolvedValueOnce(
                status === null
                    ? null
                    : {
                          userId: 'user-1',
                          role: SenderRole.ADOPTER,
                          accountStatus: status,
                      },
            );
            await expect(gateway.handleJoinRoom(client, { roomId: 'room-1' })).rejects.toBeInstanceOf(WsException);
            expect(roomManager.findRoomById).not.toHaveBeenCalled();
            expect(client.join).not.toHaveBeenCalled();
        },
    );

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
        client.handshake.auth = {};
        client.handshake.query = {};
        client.handshake.headers = {};

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

    it('정지 계정도 Socket 연결 단계에서 거부한다', async () => {
        const { gateway } = makeGateway({ accountStatus: UserStatus.SUSPENDED });
        expect(await simulateConnect(gateway, makeClient())).toBeInstanceOf(Error);
    });

    it('연결 뒤 토큰이 만료되면 재인증 후 전송을 거부하고 연결을 닫는다', async () => {
        const { gateway, sendMessageUseCase, verify } = makeGateway();
        const client = makeClient() as Parameters<ChatGateway['handleSendMessage']>[0];
        const disconnect = jest.spyOn(client, 'disconnect');
        await simulateConnect(gateway, client);
        verify.mockImplementation(() => {
            throw new Error('jwt expired');
        });
        expect(await gateway.handleSendMessage(client, { roomId: 'room-1', content: '만료된 전송' })).toMatchObject({
            success: false,
        });
        expect(disconnect).toHaveBeenCalledWith(true);
        expect(sendMessageUseCase.execute).not.toHaveBeenCalled();
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
        await gateway.broadcastNewMessage({ ...message, messageId: message.id });

        expect(to).toHaveBeenCalledTimes(1);
        expect(emit).toHaveBeenCalledTimes(1);
    });
});
