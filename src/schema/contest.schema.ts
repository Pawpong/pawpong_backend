import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContestDocument = Contest &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * 주간 콘테스트 스키마 (명예의 전당).
 * 매주 하나의 콘테스트가 active 상태로 운영되며 종료 후 ended 로 전환된다.
 */
@Schema({ timestamps: true, collection: 'contests' })
export class Contest {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    /** 참여 혜택 안내 문구 */
    @Prop({ default: '' })
    benefitText: string;

    @Prop({ required: true, index: true })
    startDate: Date;

    @Prop({ required: true, index: true })
    endDate: Date;

    @Prop({ type: String, enum: ['active', 'ended'], default: 'active', index: true })
    status: string;

    /** 참여자 수 (entry 생성 시 +1) */
    @Prop({ default: 0 })
    participantCount: number;
}

export const ContestSchema = SchemaFactory.createForClass(Contest);
