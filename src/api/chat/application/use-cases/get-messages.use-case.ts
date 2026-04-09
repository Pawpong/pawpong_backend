import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import { CHAT_MESSAGE_MANAGER, type ChatMessageManagerPort, type ChatMessageSnapshot } from '../ports/chat-message-manager.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';

@Injectable()
export class GetMessagesUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_MESSAGE_MANAGER)
        private readonly chatMessageManager: ChatMessageManagerPort,
        private readonly chatPolicyService: ChatPolicyService,
    ) {}

    async execute(userId: string, roomId: string, limit: number = 50, before?: Date): Promise<ChatMessageSnapshot[]> {
        const room = this.chatPolicyService.requireRoom(
            await this.chatRoomManager.findRoomById(roomId),
        );
        this.chatPolicyService.requireParticipant(room, userId);

        const messages = await this.chatMessageManager.findMessagesByRoomId(roomId, limit, before);
        await this.chatMessageManager.markMessagesAsRead(roomId, userId);

        return messages;
    }
}
