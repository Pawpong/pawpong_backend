import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
}

export enum SenderRole {
    ADOPTER = 'adopter',
    BREEDER = 'breeder',
}

/**
 * 채팅 메시지 스키마
 */
@Schema({ collection: 'chat_messages', timestamps: true })
export class ChatMessage {
    @Prop({ required: true })
    roomId: string;

    @Prop({ required: true })
    senderId: string;

    @Prop({ required: true, enum: SenderRole })
    senderRole: SenderRole;

    @Prop({ required: true })
    receiverId: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true, enum: MessageType, default: MessageType.TEXT })
    messageType: MessageType;

    /**
     * 수신자 읽음 여부
     */
    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    readAt?: Date;

    // timestamps: true 로 자동 생성되는 필드
    createdAt?: Date;
    updatedAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
ChatMessageSchema.index({ senderId: 1 });
ChatMessageSchema.index({ receiverId: 1, isRead: 1 });
