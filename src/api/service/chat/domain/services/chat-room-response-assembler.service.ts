import { Inject, Injectable } from '@nestjs/common';

import { type ChatRoomSnapshot } from '../../application/ports/chat-room-manager.port';
import { CHAT_MESSAGE_MANAGER, type ChatMessageManagerPort } from '../../application/ports/chat-message-manager.port';
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

    async toResult(room: ChatRoomSnapshot, viewerId: string): Promise<ChatRoomResult> {
        const counterpart = room.participants.find(({ userId }) => userId !== viewerId);
        if (!counterpart) throw new Error('1:1 채팅방의 상대 사용자를 확인할 수 없습니다.');

        const [counterpartProfile, unreadCount] = await Promise.all([
            this.participantReader.findParticipant(counterpart.userId, counterpart.role),
            this.chatMessageManager.countUnreadMessages(room.id, viewerId),
        ]);

        return {
            roomId: room.id,
            applicationIds: room.applicationIds,
            applicationId: room.applicationId,
            status: room.status,
            counterpart: counterpartProfile
                ? {
                      userId: counterpartProfile.userId,
                      role: counterpartProfile.role,
                      nickname: counterpartProfile.nickname,
                      profileImageUrl: counterpartProfile.profileImageUrl,
                  }
                : {
                      userId: counterpart.userId,
                      role: counterpart.role,
                      nickname: '알 수 없음',
                  },
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt?.toISOString(),
            unreadCount,
            createdAt: room.createdAt.toISOString(),
        };
    }

    async toResults(rooms: ChatRoomSnapshot[], viewerId: string): Promise<ChatRoomResult[]> {
        return Promise.all(rooms.map((room) => this.toResult(room, viewerId)));
    }
}
