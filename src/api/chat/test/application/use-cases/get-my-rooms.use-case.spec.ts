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
const assembler = {
    toResults: jest.fn(async (rooms) =>
        rooms.map((room: any) => ({
            roomId: room.id,
            status: room.status,
            counterpart: { userId: 'counterpart-1', role: SenderRole.BREEDER, nickname: '상대방' },
            unreadCount: 0,
            createdAt: new Date().toISOString(),
        })),
    ),
} as any;

describe('GetMyRoomsUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('ADOPTER 역할: findRoomsByAdopterId', async () => {
        const manager = makeManager([{ id: 'a-room' }], []);
        const useCase = new GetMyRoomsUseCase(manager, assembler, logger);
        const result = await useCase.execute('adopter-1', SenderRole.ADOPTER);
        expect(result).toEqual([
            expect.objectContaining({
                roomId: 'a-room',
                counterpart: expect.objectContaining({ nickname: '상대방' }),
            }),
        ]);
        expect(manager.findRoomsByAdopterId).toHaveBeenCalledWith('adopter-1');
        expect(assembler.toResults).toHaveBeenCalledWith([{ id: 'a-room' }], 'adopter-1', SenderRole.ADOPTER);
    });

    it('BREEDER 역할: findRoomsByBreederId', async () => {
        const manager = makeManager([], [{ id: 'b-room' }]);
        const useCase = new GetMyRoomsUseCase(manager, assembler, logger);
        const result = await useCase.execute('breeder-1', SenderRole.BREEDER);
        expect(result).toEqual([expect.objectContaining({ roomId: 'b-room' })]);
        expect(manager.findRoomsByBreederId).toHaveBeenCalledWith('breeder-1');
        expect(assembler.toResults).toHaveBeenCalledWith([{ id: 'b-room' }], 'breeder-1', SenderRole.BREEDER);
    });
});
