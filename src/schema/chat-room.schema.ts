import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { SenderRole } from './chat-message.schema';

export type ChatRoomDocument = ChatRoom & Document;

export enum ChatRoomStatus {
    ACTIVE = 'active',
    CLOSED = 'closed',
}

@Schema({ _id: false })
export class ChatRoomParticipant {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, type: String, enum: SenderRole })
    role: SenderRole;
}

const ChatRoomParticipantSchema = SchemaFactory.createForClass(ChatRoomParticipant);

@Schema({ _id: false })
export class ChatRoomParticipantState {
    @Prop({ required: true })
    userId: string;

    @Prop()
    lastReadMessageId?: string;

    @Prop()
    lastReadAt?: Date;

    /** 목록에서만 숨긴 시각. 방과 메시지는 삭제하지 않는다. */
    @Prop()
    hiddenAt?: Date;
}

const ChatRoomParticipantStateSchema = SchemaFactory.createForClass(ChatRoomParticipantState);

/**
 * 1:1 사용자 DM 채팅방.
 *
 * participantKey는 participantIds를 정렬해 만든 값이며, 두 사용자 사이에 방이
 * 하나만 존재하도록 보장한다. adopterId/breederId/applicationId/lastReadMessageId는
 * 마이그레이션 전 문서를 무중단으로 읽기 위한 legacy 필드다.
 */
@Schema({ collection: 'chat_rooms', timestamps: true })
export class ChatRoom {
    @Prop({
        type: [String],
        default: undefined,
        validate: {
            validator: (value?: string[]) => value === undefined || value.length === 2,
            message: 'participantIds must contain exactly 2 users',
        },
    })
    participantIds?: string[];

    @Prop({
        type: [ChatRoomParticipantSchema],
        default: undefined,
        validate: {
            validator: (value?: ChatRoomParticipant[]) => value === undefined || value.length === 2,
            message: 'participants must contain exactly 2 users',
        },
    })
    participants?: ChatRoomParticipant[];

    @Prop()
    participantKey?: string;

    @Prop({ type: [String], default: undefined })
    applicationIds?: string[];

    @Prop({ type: [ChatRoomParticipantStateSchema], default: undefined })
    participantStates?: ChatRoomParticipantState[];

    @Prop({ required: true, enum: ChatRoomStatus, default: ChatRoomStatus.ACTIVE })
    status: ChatRoomStatus;

    @Prop()
    lastMessage?: string;

    @Prop()
    lastMessageAt?: Date;

    // ── legacy adopter ↔ breeder fields ────────────────────────────────────

    @Prop()
    adopterId?: string;

    @Prop()
    breederId?: string;

    @Prop()
    applicationId?: string;

    @Prop({ type: Object, default: undefined })
    lastReadMessageId?: {
        adopter?: string;
        breeder?: string;
    };
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

// 상태와 무관하게 동일한 두 사용자 사이에는 평생 하나의 방만 허용한다.
ChatRoomSchema.index(
    { participantKey: 1 },
    {
        name: 'uniq_chat_room_participant_key',
        unique: true,
        partialFilterExpression: { participantKey: { $type: 'string' } },
    },
);
ChatRoomSchema.index({ participantIds: 1, lastMessageAt: -1 });
ChatRoomSchema.index({ 'participantStates.userId': 1, 'participantStates.hiddenAt': 1 });
