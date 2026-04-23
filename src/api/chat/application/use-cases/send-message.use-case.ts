import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import {
    CHAT_MESSAGE_MANAGER,
    type ChatMessageManagerPort,
    type ChatMessageSnapshot,
} from '../ports/chat-message-manager.port';
import { CHAT_MESSAGE_BROKER, type ChatMessageBrokerPort } from '../ports/chat-message-broker.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';
import { ChatMessageMapperService } from '../../domain/services/chat-message-mapper.service';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { SenderRole, MessageType } from '../../../../schema/chat-message.schema';
import type { SendMessageCommand } from '../types/chat-command.type';

@Injectable()
export class SendMessageUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_MESSAGE_MANAGER)
        private readonly chatMessageManager: ChatMessageManagerPort,
        @Inject(CHAT_MESSAGE_BROKER)
        private readonly chatMessageBroker: ChatMessageBrokerPort,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly chatMessageMapperService: ChatMessageMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(senderId: string, senderRole: SenderRole, command: SendMessageCommand): Promise<ChatMessageSnapshot> {
        this.logger.logStart('sendMessage', '채팅 메시지 전송 시작', { roomId: command.roomId, senderId });

        try {
            const room = this.chatPolicyService.requireRoom(await this.chatRoomManager.findRoomById(command.roomId));
            this.chatPolicyService.requireParticipant(room, senderId);

            const receiverId = this.chatPolicyService.resolveReceiverId(room, senderId);
            const messageType = command.messageType ?? MessageType.TEXT;

            const message = await this.chatMessageManager.createMessage({
                roomId: command.roomId,
                senderId,
                senderRole,
                receiverId,
                content: command.content,
                messageType,
            });

            await this.chatRoomManager.updateRoomLastMessage(command.roomId, command.content);
            await this.chatMessageBroker.publishMessage(this.chatMessageMapperService.toBroadcastPayload(message));

            this.logger.logSuccess('sendMessage', '채팅 메시지 전송 완료', { messageId: message.id });
            return message;
        } catch (error) {
            this.logger.logError('sendMessage', '채팅 메시지 전송', error);
            throw error;
        }
    }
}
