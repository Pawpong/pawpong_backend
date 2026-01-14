import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * 동영상 댓글 스키마
 */
@Schema({ timestamps: true })
export class VideoComment extends Document {
    /**
     * 동영상 ID
     */
    @Prop({ type: Types.ObjectId, ref: 'Video', required: true, index: true })
    videoId: Types.ObjectId;

    /**
     * 댓글 작성자 ID
     */
    @Prop({ type: Types.ObjectId, refPath: 'userModel', required: true, index: true })
    userId: Types.ObjectId;

    /**
     * 사용자 모델 타입 (Breeder 또는 Adopter)
     */
    @Prop({ type: String, enum: ['Breeder', 'Adopter'], required: true })
    userModel: string;

    /**
     * 댓글 내용
     */
    @Prop({ required: true, maxlength: 500 })
    content: string;

    /**
     * 부모 댓글 ID (대댓글인 경우)
     */
    @Prop({ type: Types.ObjectId, ref: 'VideoComment' })
    parentId: Types.ObjectId;

    /**
     * 좋아요 수
     */
    @Prop({ default: 0 })
    likeCount: number;

    /**
     * 삭제 여부 (soft delete)
     */
    @Prop({ default: false })
    isDeleted: boolean;

    /**
     * 생성일
     */
    @Prop({ index: true })
    createdAt: Date;

    /**
     * 수정일
     */
    @Prop()
    updatedAt: Date;
}

export const VideoCommentSchema = SchemaFactory.createForClass(VideoComment);

// 복합 인덱스
VideoCommentSchema.index({ videoId: 1, createdAt: -1 }); // 댓글 목록 조회
VideoCommentSchema.index({ parentId: 1 }); // 대댓글 조회
