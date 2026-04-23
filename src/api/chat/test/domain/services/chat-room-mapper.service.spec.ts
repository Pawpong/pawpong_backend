import { ChatRoomMapperService } from '../../../domain/services/chat-room-mapper.service';
import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';

describe('ChatRoomMapperService', () => {
    const service = new ChatRoomMapperService();

    it('ObjectId를 문자열로 변환해 스냅샷을 만든다', () => {
        const result = service.toSnapshot({
            _id: { toString: () => 'room-1' },
            adopterId: 'a-1',
            breederId: 'b-1',
            applicationId: 'app-1',
            status: ChatRoomStatus.ACTIVE,
            lastMessage: '안녕',
            lastMessageAt: new Date('2026-01-01'),
            createdAt: new Date('2025-12-01'),
        });
        expect(result.id).toBe('room-1');
        expect(result.applicationId).toBe('app-1');
    });

    it('toSnapshots: 여러 개 매핑', () => {
        const rooms = [
            {
                _id: { toString: () => 'r-1' },
                adopterId: 'a',
                breederId: 'b',
                status: ChatRoomStatus.ACTIVE,
                createdAt: new Date(),
            },
            {
                _id: { toString: () => 'r-2' },
                adopterId: 'a',
                breederId: 'b2',
                status: ChatRoomStatus.CLOSED,
                createdAt: new Date(),
            },
        ] as any[];
        const result = service.toSnapshots(rooms);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('r-1');
        expect(result[1].status).toBe(ChatRoomStatus.CLOSED);
    });
});
