import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatUserBlockDocument = ChatUserBlock & Document;

/** 차단 기록이 존재하면 두 사용자 사이의 DM 송신/재활성화를 양방향으로 막는다. */
@Schema({ collection: 'chat_user_blocks', timestamps: true })
export class ChatUserBlock {
    @Prop({ required: true })
    blockerId: string;

    @Prop({ required: true })
    blockedUserId: string;
}

export const ChatUserBlockSchema = SchemaFactory.createForClass(ChatUserBlock);

ChatUserBlockSchema.index({ blockerId: 1, blockedUserId: 1 }, { name: 'uniq_chat_user_block', unique: true });
ChatUserBlockSchema.index({ blockedUserId: 1, blockerId: 1 });
