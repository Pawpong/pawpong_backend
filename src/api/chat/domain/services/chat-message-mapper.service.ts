import { Injectable } from '@nestjs/common';

import { ChatMessageSnapshot } from '../../application/ports/chat-message-manager.port';
import { MessageType, SenderRole } from '../../../../schema/chat-message.schema';

type ChatMessageSource = {
    _id: { toString(): string };
    roomId: string;
    senderId: string;
    senderRole: SenderRole;
    receiverId: string;
    content: string;
    messageType: MessageType;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
};

@Injectable()
export class ChatMessageMapperService {
    toSnapshot(message: ChatMessageSource): ChatMessageSnapshot {
        return {
            id: message._id.toString(),
            roomId: message.roomId,
            senderId: message.senderId,
            senderRole: message.senderRole,
            receiverId: message.receiverId,
            content: message.content,
            messageType: message.messageType,
            isRead: message.isRead,
            readAt: message.readAt,
            createdAt: message.createdAt,
        };
    }

    toSnapshots(messages: ChatMessageSource[]): ChatMessageSnapshot[] {
        return messages.map((message) => this.toSnapshot(message));
    }

    toBroadcastPayload(message: ChatMessageSnapshot) {
        return {
            messageId: message.id,
            roomId: message.roomId,
            senderId: message.senderId,
            senderRole: message.senderRole,
            receiverId: message.receiverId,
            content: message.content,
            messageType: message.messageType,
            isRead: message.isRead,
            createdAt: message.createdAt,
        };
    }
}
