import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityPostCommentDocument = CommunityPostComment &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * v2 커뮤니티 게시글 댓글 (Figma 315:5433).
 *
 * parentCommentId 가 있으면 대댓글(답글). null/없으면 최상위 댓글.
 * 작성자 메타(nickname/profileImageFileName)는 작성 시점에 denormalized 로 임베드.
 */
@Schema({ timestamps: true, collection: 'community_post_comments' })
export class CommunityPostComment {
    @Prop({ type: Types.ObjectId, ref: 'CommunityPost', required: true, index: true })
    postId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    authorId: Types.ObjectId;

    @Prop({ type: String, enum: ['Adopter', 'Breeder'], required: true })
    authorModel: 'Adopter' | 'Breeder';

    @Prop({ type: String, required: true })
    authorNickname: string;

    @Prop({ type: String })
    authorProfileImageFileName?: string;

    @Prop({ type: Types.ObjectId, ref: 'CommunityPostComment', default: null, index: true })
    parentCommentId?: Types.ObjectId | null;

    @Prop({ type: String, required: true, maxlength: 1000 })
    body: string;

    @Prop({ type: Number, default: 0, min: 0 })
    likeCount: number;

    @Prop({ type: Boolean, default: true, index: true })
    isActive: boolean;
}

export const CommunityPostCommentSchema = SchemaFactory.createForClass(CommunityPostComment);

// 상세 페이지 댓글 목록 정렬용
CommunityPostCommentSchema.index({ postId: 1, isActive: 1, createdAt: 1 });
// 답글 트리 조회용
CommunityPostCommentSchema.index({ parentCommentId: 1, isActive: 1, createdAt: 1 });
