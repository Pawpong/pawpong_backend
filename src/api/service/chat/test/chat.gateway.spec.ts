import { WsException } from '@nestjs/websockets';

import { ChatGateway } from '../chat.gateway';
import { ChatPolicyService } from '../domain/services/chat-policy.service';
import { ChatRoomStatus } from '../../../../schema/chat-room.schema';
import { MessageType, SenderRole } from '../../../../schema/chat-message.schema';
import { UserStatus } from '../../../../common/enum/user.enum';

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
    } = {},
) {
    const {
        roomResult = room,
        payload = { sub: 'user-1', role: 'adopter' },
        accountStatus = UserStatus.ACTIVE,
        brokerPublished = true,
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

    const gateway = new ChatGateway(
        sendMessageUseCase as any,
        { execute: jest.fn() } as any,
        roomManager,
        {
            findParticipant: jest.fn().mockResolvedValue({
                userId: payload.sub,
                role: payload.role,
                accountStatus,
            }),
        } as any,
        new ChatPolicyService(),
        mapper as any,
        { verify: jest.fn().mockReturnValue(payload) } as any,
        { get: jest.fn().mockReturnValue('secret') } as any,
        { logSuccess: jest.fn() } as any,
    );

    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    gateway.server = { to } as any;

    return { gateway, roomManager, sendMessageUseCase, mapper, to, emit };
}

describe('ChatGateway', () => {
    it('JWT 사용자이면서 실제 참여자인 경우에만 Socket.IO room에 입장시킨다', async () => {
        const { gateway, roomManager } = makeGateway();
        const client = makeClient();
        await gateway.handleConnection(client);
        await gateway.handleJoinRoom(client, { roomId: 'room-1' });
        expect(roomManager.findRoomById).toHaveBeenCalledWith('room-1');
        expect(client.join).toHaveBeenCalledWith('room-1');
    });

    it('JWT는 유효해도 채팅방 비참여자는 join_room을 거부한다', async () => {
        const { gateway } = makeGateway({ payload: { sub: 'outsider', role: 'adopter' } });
        const client = makeClient();
        await gateway.handleConnection(client);
        await expect(gateway.handleJoinRoom(client, { roomId: 'room-1' })).rejects.toBeInstanceOf(WsException);
        expect(client.join).not.toHaveBeenCalled();
    });

    it('지원하지 않는 역할의 JWT 연결은 즉시 끊는다', async () => {
        const { gateway } = makeGateway({ payload: { sub: 'admin-1', role: 'admin' } });
        const client = makeClient();
        await gateway.handleConnection(client);
        expect(client.disconnect).toHaveBeenCalled();
        await expect(gateway.handleJoinRoom(client, { roomId: 'room-1' })).rejects.toBeInstanceOf(WsException);
    });

    it('탈퇴 계정의 유효기간이 남은 JWT도 Socket 연결 단계에서 거부한다', async () => {
        const { gateway } = makeGateway({ accountStatus: UserStatus.DELETED });
        const client = makeClient();
        await gateway.handleConnection(client);
        expect(client.disconnect).toHaveBeenCalled();
    });

    it('Kafka 발행 실패 시 현재 인스턴스에 새 메시지를 직접 전파한다', async () => {
        const { gateway, mapper, to, emit } = makeGateway({ brokerPublished: false });
        const client = makeClient();
        await gateway.handleConnection(client);

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
        const { gateway, mapper, to } = makeGateway({ brokerPublished: true });
        const client = makeClient();
        await gateway.handleConnection(client);

        await gateway.handleSendMessage(client, {
            roomId: 'room-1',
            content: '안녕',
            messageType: MessageType.TEXT,
        });

        expect(mapper.toBroadcastPayload).not.toHaveBeenCalled();
        expect(to).not.toHaveBeenCalled();
    });
});
