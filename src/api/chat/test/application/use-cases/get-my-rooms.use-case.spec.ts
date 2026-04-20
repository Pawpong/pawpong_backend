import { GetMyRoomsUseCase } from '../../../application/use-cases/get-my-rooms.use-case';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';
import { SenderRole } from '../../../../../schema/chat-message.schema';

function makeManager(adopterRooms: any[], breederRooms: any[]): ChatRoomManagerPort {
    return {
        findRoomById: jest.fn(),
        findRoomByParticipants: jest.fn(),
        findRoomsByAdopterId: jest.fn().mockResolvedValue(adopterRooms),
        findRoomsByBreederId: jest.fn().mockResolvedValue(breederRooms),
        createRoom: jest.fn(),
        updateRoomLastMessage: jest.fn(),
        closeRoom: jest.fn(),
    };
}

const logger = { logStart: jest.fn(), logSuccess: jest.fn(), logError: jest.fn() } as any;

describe('GetMyRoomsUseCase', () => {
    it('ADOPTER 역할: findRoomsByAdopterId', async () => {
        const manager = makeManager([{ id: 'a-room' }], []);
        const useCase = new GetMyRoomsUseCase(manager, logger);
        const result = await useCase.execute('adopter-1', SenderRole.ADOPTER);
        expect(result).toEqual([{ id: 'a-room' }]);
        expect(manager.findRoomsByAdopterId).toHaveBeenCalledWith('adopter-1');
    });

    it('BREEDER 역할: findRoomsByBreederId', async () => {
        const manager = makeManager([], [{ id: 'b-room' }]);
        const useCase = new GetMyRoomsUseCase(manager, logger);
        const result = await useCase.execute('breeder-1', SenderRole.BREEDER);
        expect(result).toEqual([{ id: 'b-room' }]);
        expect(manager.findRoomsByBreederId).toHaveBeenCalledWith('breeder-1');
    });
});
