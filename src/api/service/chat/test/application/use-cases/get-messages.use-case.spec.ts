import { GetMessagesUseCase } from '../../../application/use-cases/get-messages.use-case';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';
import { ChatMessageManagerPort } from '../../../application/ports/chat-message-manager.port';
import { ChatRoomStatus } from '../../../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../../../schema/chat-message.schema';
import { DomainAuthorizationError, DomainNotFoundError } from '../../../../../../common/error/domain.error';

const room = {
    id: 'room-1',
    participantIds: ['a-1', 'b-1'],
    participants: [
        { userId: 'a-1', role: SenderRole.ADOPTER },
        { userId: 'b-1', role: SenderRole.BREEDER },
    ],
    participantKey: 'a-1:b-1',
    participantStates: [{ userId: 'a-1' }, { userId: 'b-1' }],
    applicationIds: [],
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
};

function makeRoomManager(findResult: any = room): ChatRoomManagerPort {
    return {
        findRoomById: jest.fn().mockResolvedValue(findResult),
        findRoomByParticipants: jest.fn(),
        findRoomsByParticipantId: jest.fn(),
        createRoom: jest.fn(),
        activateRoom: jest.fn(),
        updateRoomLastMessage: jest.fn(),
        updateReadMarker: jest.fn().mockResolvedValue(undefined),
        hideRoom: jest.fn(),
    };
}

function makeMessageManager(messages: any[] = []): ChatMessageManagerPort {
    return {
        createMessage: jest.fn(),
        findMessagesByRoomId: jest.fn().mockResolvedValue(messages),
        markMessagesAsRead: jest.fn().mockResolvedValue(undefined),
        countUnreadMessages: jest.fn().mockResolvedValue(0),
    };
}

const logger = { logStart: jest.fn(), logSuccess: jest.fn(), logError: jest.fn() } as any;

describe('GetMessagesUseCase', () => {
    const policy = new ChatPolicyService();

    it('메시지를 조회하고 메시지와 방의 사용자별 읽음 마커를 함께 갱신한다', async () => {
        const messageManager = makeMessageManager([{ id: 'm-2' }, { id: 'm-1' }]);
        const roomManager = makeRoomManager();
        const useCase = new GetMessagesUseCase(roomManager, messageManager, policy, logger);
        const result = await useCase.execute('a-1', { roomId: 'room-1' });
        expect(result).toHaveLength(2);
        expect(messageManager.markMessagesAsRead).toHaveBeenCalledWith('room-1', 'a-1');
        expect(roomManager.updateReadMarker).toHaveBeenCalledWith('room-1', 'a-1', 'm-2');
    });

    it('limit 미지정 시 기본 50', async () => {
        const messageManager = makeMessageManager();
        const useCase = new GetMessagesUseCase(makeRoomManager(), messageManager, policy, logger);
        await useCase.execute('a-1', { roomId: 'room-1' });
        expect(messageManager.findMessagesByRoomId).toHaveBeenCalledWith('room-1', 50, undefined);
    });

    it('limit + before 전달', async () => {
        const messageManager = makeMessageManager();
        const before = new Date('2026-01-01');
        const useCase = new GetMessagesUseCase(makeRoomManager(), messageManager, policy, logger);
        await useCase.execute('a-1', { roomId: 'room-1', limit: 20, before });
        expect(messageManager.findMessagesByRoomId).toHaveBeenCalledWith('room-1', 20, before);
    });

    it('방이 없으면 DomainNotFoundError', async () => {
        const useCase = new GetMessagesUseCase(makeRoomManager(null), makeMessageManager(), policy, logger);
        await expect(useCase.execute('a', { roomId: 'x' })).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('참여자가 아니면 DomainAuthorizationError', async () => {
        const useCase = new GetMessagesUseCase(makeRoomManager(), makeMessageManager(), policy, logger);
        await expect(useCase.execute('other', { roomId: 'room-1' })).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});
