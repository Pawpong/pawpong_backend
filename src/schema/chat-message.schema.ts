import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
    LOCATION = 'location',
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

    /** 연결 재시도 시 같은 발신 요청을 한 번만 저장하기 위한 선택 식별자. */
    @Prop()
    clientMessageId?: string;

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
// 구버전 메시지는 식별자가 없어도 계속 저장할 수 있다.
ChatMessageSchema.index(
    { roomId: 1, senderId: 1, clientMessageId: 1 },
    { unique: true, partialFilterExpression: { clientMessageId: { $type: 'string' } } },
);
