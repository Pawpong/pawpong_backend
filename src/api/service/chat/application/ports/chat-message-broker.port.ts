import { MessageType, SenderRole } from '../../../../../schema/chat-message.schema';

export interface ChatMessageBrokerPayload {
    messageId: string;
    roomId: string;
    senderId: string;
    senderRole: SenderRole;
    receiverId: string;
    content: string;
    messageType: MessageType;
    isRead: boolean;
    createdAt: Date;
}

export interface ChatRoomLifecyclePayload {
    roomId: string;
    participantIds?: string[];
    participants?: Array<{ userId: string; role: SenderRole }>;
    applicationIds?: string[];
    adopterId?: string;
    breederId?: string;
    applicationId?: string;
    closedBy?: string;
    timestamp?: Date;
}

export const CHAT_MESSAGE_BROKER = Symbol('CHAT_MESSAGE_BROKER');

export interface ChatMessageBrokerPort {
    publishMessage(payload: ChatMessageBrokerPayload): Promise<void>;
    publishRoomCreated(payload: ChatRoomLifecyclePayload): Promise<void>;
    publishRoomClosed(payload: ChatRoomLifecyclePayload): Promise<void>;
}
