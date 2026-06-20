import { Inject, Injectable } from '@nestjs/common';

import { SenderRole } from '../../../../schema/chat-message.schema';
import { type ChatRoomSnapshot } from '../../application/ports/chat-room-manager.port';
import {
    CHAT_MESSAGE_MANAGER,
    type ChatMessageManagerPort,
} from '../../application/ports/chat-message-manager.port';
import {
    CHAT_PARTICIPANT_READER,
    type ChatParticipantReaderPort,
} from '../../application/ports/chat-participant-reader.port';
import type { ChatRoomResult } from '../../application/types/chat-room-result.type';

@Injectable()
export class ChatRoomResponseAssemblerService {
    constructor(
        @Inject(CHAT_MESSAGE_MANAGER)
        private readonly chatMessageManager: ChatMessageManagerPort,
        @Inject(CHAT_PARTICIPANT_READER)
        private readonly participantReader: ChatParticipantReaderPort,
    ) {}

    async toResult(room: ChatRoomSnapshot, viewerId: string, viewerRole: SenderRole): Promise<ChatRoomResult> {
        const counterpartRole = viewerRole === SenderRole.ADOPTER ? SenderRole.BREEDER : SenderRole.ADOPTER;
        const counterpartId = counterpartRole === SenderRole.BREEDER ? room.breederId : room.adopterId;

        const [counterpartProfile, unreadCount] = await Promise.all([
            this.participantReader.findProfile(counterpartId, counterpartRole),
            this.chatMessageManager.countUnreadMessages(room.id, viewerId),
        ]);

        return {
            roomId: room.id,
            applicationId: room.applicationId,
            status: room.status,
            counterpart: counterpartProfile ?? {
                userId: counterpartId,
                role: counterpartRole,
                nickname: '알 수 없음',
            },
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt?.toISOString(),
            unreadCount,
            createdAt: room.createdAt.toISOString(),
        };
    }

    async toResults(rooms: ChatRoomSnapshot[], viewerId: string, viewerRole: SenderRole): Promise<ChatRoomResult[]> {
        return Promise.all(rooms.map((room) => this.toResult(room, viewerId, viewerRole)));
    }
}
