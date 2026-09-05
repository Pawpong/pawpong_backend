import { CloseRoomUseCase } from '../../../application/use-cases/close-room.use-case';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';
import { ChatMessageBrokerPort } from '../../../application/ports/chat-message-broker.port';
import { ChatRoomStatus } from '../../../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../../../schema/chat-message.schema';
import { DomainAuthorizationError, DomainNotFoundError } from '../../../../../../common/error/domain.error';

const room = {
    id: 'room-1',
    participantIds: ['adopter-1', 'breeder-1'],
    participants: [
        { userId: 'adopter-1', role: SenderRole.ADOPTER },
        { userId: 'breeder-1', role: SenderRole.BREEDER },
    ],
    participantKey: 'adopter-1:breeder-1',
    participantStates: [{ userId: 'adopter-1' }, { userId: 'breeder-1' }],
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
        updateReadMarker: jest.fn(),
        hideRoom: jest.fn().mockResolvedValue(undefined),
    };
}

function makeBroker(): ChatMessageBrokerPort {
    return {
        publishMessage: jest.fn(),
        publishRoomCreated: jest.fn(),
        publishRoomClosed: jest.fn().mockResolvedValue(undefined),
    };
}

const logger = { logStart: jest.fn(), logSuccess: jest.fn(), logError: jest.fn() } as any;

describe('CloseRoomUseCase', () => {
    const policy = new ChatPolicyService();

    it('참여자가 삭제하면 요청자의 목록에서만 숨기고 lifecycle 이벤트를 발행한다', async () => {
        const manager = makeRoomManager();
        const broker = makeBroker();
        const useCase = new CloseRoomUseCase(manager, broker, policy, logger);
        await useCase.execute('adopter-1', 'room-1');
        expect(manager.hideRoom).toHaveBeenCalledWith('room-1', 'adopter-1');
        expect(broker.publishRoomClosed).toHaveBeenCalledWith(
            expect.objectContaining({ roomId: 'room-1', closedBy: 'adopter-1' }),
        );
    });

    it('방이 없으면 DomainNotFoundError', async () => {
        const useCase = new CloseRoomUseCase(makeRoomManager(null), makeBroker(), policy, logger);
        await expect(useCase.execute('a', 'x')).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('참여자가 아니면 DomainAuthorizationError', async () => {
        const useCase = new CloseRoomUseCase(makeRoomManager(), makeBroker(), policy, logger);
        await expect(useCase.execute('other', 'room-1')).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});
