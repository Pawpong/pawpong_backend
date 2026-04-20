import { Injectable } from '@nestjs/common';

import { DomainAuthorizationError, DomainNotFoundError } from '../../../../common/error/domain.error';
import { ChatRoomSnapshot } from '../../application/ports/chat-room-manager.port';

@Injectable()
export class ChatPolicyService {
    requireRoom(room: ChatRoomSnapshot | null): ChatRoomSnapshot {
        if (!room) {
            throw new DomainNotFoundError('채팅방을 찾을 수 없습니다.');
        }
        return room;
    }

    requireParticipant(room: ChatRoomSnapshot, userId: string): void {
        if (room.adopterId !== userId && room.breederId !== userId) {
            throw new DomainAuthorizationError('채팅방 참여자가 아닙니다.');
        }
    }

    resolveReceiverId(room: ChatRoomSnapshot, senderId: string): string {
        return room.adopterId === senderId ? room.breederId : room.adopterId;
    }

    ensureAdopterRole(role: string): void {
        if (role !== 'adopter') {
            throw new DomainAuthorizationError('채팅방은 입양자만 생성할 수 있습니다.');
        }
    }
}
