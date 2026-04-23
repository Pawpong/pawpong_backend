import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import {
    CHAT_MESSAGE_MANAGER,
    type ChatMessageManagerPort,
    type ChatMessageSnapshot,
} from '../ports/chat-message-manager.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import type { GetMessagesQuery } from '../types/chat-command.type';

@Injectable()
export class GetMessagesUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_MESSAGE_MANAGER)
        private readonly chatMessageManager: ChatMessageManagerPort,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string, query: GetMessagesQuery): Promise<ChatMessageSnapshot[]> {
        const limit = query.limit ?? 50;
        this.logger.logStart('getMessages', '채팅 메시지 조회 시작', { userId, roomId: query.roomId, limit });

        try {
            const room = this.chatPolicyService.requireRoom(await this.chatRoomManager.findRoomById(query.roomId));
            this.chatPolicyService.requireParticipant(room, userId);

            const messages = await this.chatMessageManager.findMessagesByRoomId(query.roomId, limit, query.before);
            await this.chatMessageManager.markMessagesAsRead(query.roomId, userId);

            this.logger.logSuccess('getMessages', '채팅 메시지 조회 완료', {
                roomId: query.roomId,
                count: messages.length,
            });
            return messages;
        } catch (error) {
            this.logger.logError('getMessages', '채팅 메시지 조회', error);
            throw error;
        }
    }
}
