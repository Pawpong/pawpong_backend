import { WsException } from '@nestjs/websockets';

import { ChatGateway } from '../chat.gateway';
import { ChatPolicyService } from '../domain/services/chat-policy.service';
import { ChatRoomStatus } from '../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../schema/chat-message.schema';
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
    roomResult: any = room,
    payload: any = { sub: 'user-1', role: 'adopter' },
    accountStatus = UserStatus.ACTIVE,
) {
    const roomManager = {
        findRoomById: jest.fn().mockResolvedValue(roomResult),
    } as any;
    const gateway = new ChatGateway(
        { execute: jest.fn() } as any,
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
        { verify: jest.fn().mockReturnValue(payload) } as any,
        { get: jest.fn().mockReturnValue('secret') } as any,
        { logSuccess: jest.fn() } as any,
    );
    return { gateway, roomManager };
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
        const { gateway } = makeGateway(room, { sub: 'outsider', role: 'adopter' });
        const client = makeClient();
        await gateway.handleConnection(client);
        await expect(gateway.handleJoinRoom(client, { roomId: 'room-1' })).rejects.toBeInstanceOf(WsException);
        expect(client.join).not.toHaveBeenCalled();
    });

    it('지원하지 않는 역할의 JWT 연결은 즉시 끊는다', async () => {
        const { gateway } = makeGateway(room, { sub: 'admin-1', role: 'admin' });
        const client = makeClient();
        await gateway.handleConnection(client);
        expect(client.disconnect).toHaveBeenCalled();
        await expect(gateway.handleJoinRoom(client, { roomId: 'room-1' })).rejects.toBeInstanceOf(WsException);
    });

    it('탈퇴 계정의 유효기간이 남은 JWT도 Socket 연결 단계에서 거부한다', async () => {
        const { gateway } = makeGateway(room, { sub: 'user-1', role: 'adopter' }, UserStatus.DELETED);
        const client = makeClient();
        await gateway.handleConnection(client);
        expect(client.disconnect).toHaveBeenCalled();
    });
});
