import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { ChatRoomSnapshot } from '../../application/ports/chat-room-manager.port';

@Injectable()
export class ChatPolicyService {
    requireRoom(room: ChatRoomSnapshot | null): ChatRoomSnapshot {
        if (!room) {
            throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        }
        return room;
    }

    requireParticipant(room: ChatRoomSnapshot, userId: string): void {
        if (room.adopterId !== userId && room.breederId !== userId) {
            throw new ForbiddenException('채팅방 참여자가 아닙니다.');
        }
    }
}
