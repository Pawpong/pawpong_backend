import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityPostLikeDocument = CommunityPostLike &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
    };

/**
 * v2 커뮤니티 게시글 좋아요.
 * (postId, userId) 복합 유니크 인덱스로 중복 방지.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'community_post_likes' })
export class CommunityPostLike {
    @Prop({ type: Types.ObjectId, ref: 'CommunityPost', required: true, index: true })
    postId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: ['Adopter', 'Breeder'], required: true })
    userModel: 'Adopter' | 'Breeder';
}

export const CommunityPostLikeSchema = SchemaFactory.createForClass(CommunityPostLike);

CommunityPostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
