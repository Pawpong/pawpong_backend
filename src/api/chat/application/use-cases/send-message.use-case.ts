import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import { CHAT_MESSAGE_MANAGER, type ChatMessageManagerPort, type ChatMessageSnapshot } from '../ports/chat-message-manager.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';
import { KafkaService, KafkaTopic } from '../../../../common/kafka/kafka.service';
import { SenderRole, MessageType } from '../../../../schema/chat-message.schema';
import { SendMessageRequestDto } from '../../dto/request/send-message-request.dto';

@Injectable()
export class SendMessageUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_MESSAGE_MANAGER)
        private readonly chatMessageManager: ChatMessageManagerPort,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly kafkaService: KafkaService,
    ) {}

    async execute(
        senderId: string,
        senderRole: SenderRole,
        dto: SendMessageRequestDto,
    ): Promise<ChatMessageSnapshot> {
        const room = this.chatPolicyService.requireRoom(
            await this.chatRoomManager.findRoomById(dto.roomId),
        );
        this.chatPolicyService.requireParticipant(room, senderId);

        const receiverId = senderRole === SenderRole.ADOPTER ? room.breederId : room.adopterId;
        const messageType = dto.messageType ?? MessageType.TEXT;

        const message = await this.chatMessageManager.createMessage({
            roomId: dto.roomId,
            senderId,
            senderRole,
            receiverId,
            content: dto.content,
            messageType,
        });

        await this.chatRoomManager.updateRoomLastMessage(dto.roomId, dto.content);

        await this.kafkaService.emit(KafkaTopic.CHAT_MESSAGE, {
            messageId: message.id,
            roomId: dto.roomId,
            senderId,
            senderRole,
            receiverId,
            content: dto.content,
            messageType,
            timestamp: new Date(),
        });

        return message;
    }
}
