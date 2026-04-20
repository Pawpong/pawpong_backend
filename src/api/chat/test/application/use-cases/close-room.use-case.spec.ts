import { CloseRoomUseCase } from '../../../application/use-cases/close-room.use-case';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';
import { ChatMessageBrokerPort } from '../../../application/ports/chat-message-broker.port';
import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';
import { DomainAuthorizationError, DomainNotFoundError } from '../../../../../common/error/domain.error';

const room = {
    id: 'room-1',
    adopterId: 'adopter-1',
    breederId: 'breeder-1',
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
};

function makeRoomManager(findResult: any = room): ChatRoomManagerPort {
    return {
        findRoomById: jest.fn().mockResolvedValue(findResult),
        findRoomByParticipants: jest.fn(),
        findRoomsByAdopterId: jest.fn(),
        findRoomsByBreederId: jest.fn(),
        createRoom: jest.fn(),
        updateRoomLastMessage: jest.fn(),
        closeRoom: jest.fn().mockResolvedValue(undefined),
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

    it('참여자가 방을 종료하면 closeRoom + publishRoomClosed 호출', async () => {
        const manager = makeRoomManager();
        const broker = makeBroker();
        const useCase = new CloseRoomUseCase(manager, broker, policy, logger);
        await useCase.execute('adopter-1', 'room-1');
        expect(manager.closeRoom).toHaveBeenCalledWith('room-1');
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
