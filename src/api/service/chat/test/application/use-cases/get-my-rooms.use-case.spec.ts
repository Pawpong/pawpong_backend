import { GetMyRoomsUseCase } from '../../../application/use-cases/get-my-rooms.use-case';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';

function makeManager(rooms: any[]): ChatRoomManagerPort {
    return {
        findRoomById: jest.fn(),
        findRoomByParticipants: jest.fn(),
        findRoomsByParticipantId: jest.fn().mockResolvedValue(rooms),
        createRoom: jest.fn(),
        activateRoom: jest.fn(),
        updateRoomLastMessage: jest.fn(),
        updateReadMarker: jest.fn(),
        hideRoom: jest.fn(),
    };
}

const logger = { logStart: jest.fn(), logSuccess: jest.fn(), logError: jest.fn() } as any;
const assembler = {
    toResults: jest.fn(async (rooms) => rooms.map((room: any) => ({ roomId: room.id }))),
} as any;

describe('GetMyRoomsUseCase', () => {
    beforeEach(() => jest.clearAllMocks());

    it('역할 분기 없이 participantIds 기준으로 내 방을 조회한다', async () => {
        const manager = makeManager([{ id: 'room-1' }]);
        const useCase = new GetMyRoomsUseCase(manager, assembler, logger);
        const result = await useCase.execute('user-1');
        expect(result).toEqual([{ roomId: 'room-1' }]);
        expect(manager.findRoomsByParticipantId).toHaveBeenCalledWith('user-1');
        expect(assembler.toResults).toHaveBeenCalledWith([{ id: 'room-1' }], 'user-1');
    });
});
