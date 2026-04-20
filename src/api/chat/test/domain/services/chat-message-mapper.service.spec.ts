import { ChatMessageMapperService } from '../../../domain/services/chat-message-mapper.service';
import { MessageType, SenderRole } from '../../../../../schema/chat-message.schema';

describe('ChatMessageMapperService', () => {
    const service = new ChatMessageMapperService();

    const source = {
        _id: { toString: () => 'msg-1' },
        roomId: 'room-1',
        senderId: 'user-1',
        senderRole: SenderRole.ADOPTER,
        receiverId: 'breeder-1',
        content: '안녕',
        messageType: MessageType.TEXT,
        isRead: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
    } as any;

    it('메시지 스냅샷 생성 (id 필드 변환)', () => {
        const result = service.toSnapshot(source);
        expect(result.id).toBe('msg-1');
        expect(result.senderRole).toBe(SenderRole.ADOPTER);
        expect(result.messageType).toBe(MessageType.TEXT);
    });

    it('toBroadcastPayload: 브로커 페이로드로 변환 (messageId 이름 사용)', () => {
        const snapshot = service.toSnapshot(source);
        const payload = service.toBroadcastPayload(snapshot);
        expect(payload.messageId).toBe('msg-1');
        expect(payload.roomId).toBe('room-1');
    });

    it('toSnapshots: 여러 개 변환', () => {
        const result = service.toSnapshots([source, { ...source, _id: { toString: () => 'msg-2' } }]);
        expect(result).toHaveLength(2);
        expect(result[1].id).toBe('msg-2');
    });
});
