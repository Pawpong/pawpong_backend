import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * 동영상 좋아요 스키마
 * 사용자별 좋아요 상태 추적
 */
@Schema({ timestamps: true })
export class VideoLike extends Document {
    /**
     * 동영상 ID
     */
    @Prop({ type: Types.ObjectId, ref: 'Video', required: true, index: true })
    videoId: Types.ObjectId;

    /**
     * 좋아요 누른 사용자 ID
     */
    @Prop({ type: Types.ObjectId, refPath: 'userModel', required: true, index: true })
    userId: Types.ObjectId;

    /**
     * 사용자 모델 타입 (Breeder 또는 Adopter)
     */
    @Prop({ type: String, enum: ['Breeder', 'Adopter'], required: true })
    userModel: string;

    /**
     * 생성일
     */
    @Prop()
    createdAt: Date;
}

export const VideoLikeSchema = SchemaFactory.createForClass(VideoLike);

// 복합 유니크 인덱스 (한 사용자가 한 동영상에 좋아요 하나만)
VideoLikeSchema.index({ videoId: 1, userId: 1 }, { unique: true });
