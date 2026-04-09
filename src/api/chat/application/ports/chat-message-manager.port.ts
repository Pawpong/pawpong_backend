import { MessageType, SenderRole } from '../../../../schema/chat-message.schema';

export interface ChatMessageSnapshot {
    id: string;
    roomId: string;
    senderId: string;
    senderRole: SenderRole;
    receiverId: string;
    content: string;
    messageType: MessageType;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
}

export const CHAT_MESSAGE_MANAGER = Symbol('CHAT_MESSAGE_MANAGER');

export interface ChatMessageManagerPort {
    createMessage(data: {
        roomId: string;
        senderId: string;
        senderRole: SenderRole;
        receiverId: string;
        content: string;
        messageType: MessageType;
    }): Promise<ChatMessageSnapshot>;
    findMessagesByRoomId(roomId: string, limit: number, before?: Date): Promise<ChatMessageSnapshot[]>;
    markMessagesAsRead(roomId: string, receiverId: string): Promise<void>;
}
