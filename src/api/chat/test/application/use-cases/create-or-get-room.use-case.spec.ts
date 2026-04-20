import { CreateOrGetRoomUseCase } from '../../../application/use-cases/create-or-get-room.use-case';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';
import { ChatMessageBrokerPort } from '../../../application/ports/chat-message-broker.port';
import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';

function makeRoomManager(existing: any = null, created: any = null): ChatRoomManagerPort {
    return {
        findRoomById: jest.fn(),
        findRoomByParticipants: jest.fn().mockResolvedValue(existing),
        findRoomsByAdopterId: jest.fn(),
        findRoomsByBreederId: jest.fn(),
        createRoom: jest.fn().mockResolvedValue(created),
        updateRoomLastMessage: jest.fn(),
        closeRoom: jest.fn(),
    };
}

function makeBroker(): ChatMessageBrokerPort {
    return {
        publishMessage: jest.fn(),
        publishRoomCreated: jest.fn().mockResolvedValue(undefined),
        publishRoomClosed: jest.fn(),
    };
}

function makeLogger() {
    return { logStart: jest.fn(), logSuccess: jest.fn(), logError: jest.fn() } as any;
}

const createdRoom = {
    id: 'room-1',
    adopterId: 'adopter-1',
    breederId: 'breeder-1',
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
};

describe('CreateOrGetRoomUseCase', () => {
    it('기존 방이 있으면 브로커 호출 없이 반환한다', async () => {
        const broker = makeBroker();
        const useCase = new CreateOrGetRoomUseCase(makeRoomManager(createdRoom), broker, makeLogger());
        const result = await useCase.execute('adopter-1', { breederId: 'breeder-1' });
        expect(result).toBe(createdRoom);
        expect(broker.publishRoomCreated).not.toHaveBeenCalled();
    });

    it('기존 방이 없으면 생성하고 브로커로 발행한다', async () => {
        const broker = makeBroker();
        const manager = makeRoomManager(null, createdRoom);
        const useCase = new CreateOrGetRoomUseCase(manager, broker, makeLogger());
        const result = await useCase.execute('adopter-1', { breederId: 'breeder-1', applicationId: 'app-1' });
        expect(result.id).toBe('room-1');
        expect(manager.createRoom).toHaveBeenCalledWith('adopter-1', 'breeder-1', 'app-1');
        expect(broker.publishRoomCreated).toHaveBeenCalledWith(
            expect.objectContaining({ roomId: 'room-1', applicationId: 'app-1' }),
        );
    });
});
