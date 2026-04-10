import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;

export enum ChatRoomStatus {
    ACTIVE = 'active',
    CLOSED = 'closed',
}

/**
 * 채팅방 스키마
 * - adopter ↔ breeder 1:1 채팅방
 * - applicationId 기반으로 생성됨 (입양 상담 신청 연결)
 */
@Schema({ collection: 'chat_rooms', timestamps: true })
export class ChatRoom {
    @Prop({ required: true })
    adopterId: string;

    @Prop({ required: true })
    breederId: string;

    /**
     * 연결된 입양 상담 신청 ID (optional)
     */
    @Prop()
    applicationId?: string;

    @Prop({ required: true, enum: ChatRoomStatus, default: ChatRoomStatus.ACTIVE })
    status: ChatRoomStatus;

    /**
     * 각 참여자의 마지막 읽은 메시지 ID
     */
    @Prop({ type: Object, default: {} })
    lastReadMessageId: {
        adopter?: string;
        breeder?: string;
    };

    @Prop()
    lastMessage?: string;

    @Prop()
    lastMessageAt?: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

// 복합 인덱스: ACTIVE 상태인 방에 한해 동일 adopter-breeder 쌍 중복 방지
// CLOSED 방은 중복 허용 → 재채팅 시 새 방 생성 가능
ChatRoomSchema.index(
    { adopterId: 1, breederId: 1 },
    { unique: true, partialFilterExpression: { status: ChatRoomStatus.ACTIVE } },
);
ChatRoomSchema.index({ adopterId: 1, status: 1 });
ChatRoomSchema.index({ breederId: 1, status: 1 });
