import { Injectable } from '@nestjs/common';

import { ChatRoomSnapshot } from '../../application/ports/chat-room-manager.port';
import { ChatRoomStatus } from '../../../../schema/chat-room.schema';

type ChatRoomSource = {
    _id: { toString(): string };
    adopterId: string;
    breederId: string;
    applicationId?: string;
    status: ChatRoomStatus;
    lastMessage?: string;
    lastMessageAt?: Date;
    createdAt: Date;
};

@Injectable()
export class ChatRoomMapperService {
    toSnapshot(room: ChatRoomSource): ChatRoomSnapshot {
        return {
            id: room._id.toString(),
            adopterId: room.adopterId,
            breederId: room.breederId,
            applicationId: room.applicationId,
            status: room.status,
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
            createdAt: room.createdAt,
        };
    }

    toSnapshots(rooms: ChatRoomSource[]): ChatRoomSnapshot[] {
        return rooms.map((room) => this.toSnapshot(room));
    }
}
