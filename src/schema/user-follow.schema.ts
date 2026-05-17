import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserFollowDocument = UserFollow &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
    };

/**
 * 팔로우 관계 (Figma 678:46565).
 * 팔로워(follower) → 팔로위(followee) 방향.
 * 팔로우 발생 시 followee 의 Adopter.followerCount 를 원자적으로 갱신한다.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'user_follows' })
export class UserFollow {
    /** 팔로우를 시작한 사용자 ID (ObjectId 문자열) */
    @Prop({ required: true, index: true })
    followerId: string;

    /** 팔로우 대상 사용자 ID (ObjectId 문자열, Adopter) */
    @Prop({ required: true, index: true })
    followeeId: string;

    createdAt: Date;
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollow);

/** 같은 쌍 중복 방지 */
UserFollowSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });
