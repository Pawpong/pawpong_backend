import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityPostReportDocument = CommunityPostReport &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

export type CommunityReportReason = 'spam' | 'inappropriate_content' | 'false_info' | 'hateful_content' | 'other';
export type CommunityReportStatus = 'pending' | 'resolved' | 'dismissed';

/**
 * v2 커뮤니티 게시글 신고 (Figma 315:5433).
 *
 * 유저당 게시글 1건만 신고 가능 — (postId, reporterId) 복합 unique 인덱스.
 * resolve → 게시글 isActive=false(숨김) + status=resolved.
 * dismiss → status=dismissed (게시글 변경 없음).
 */
@Schema({ timestamps: true, collection: 'community_post_reports' })
export class CommunityPostReport {
    @Prop({ type: Types.ObjectId, ref: 'CommunityPost', required: true, index: true })
    postId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    reporterId: Types.ObjectId;

    @Prop({ type: String, enum: ['Adopter', 'Breeder'], required: true })
    reporterModel: 'Adopter' | 'Breeder';

    /** 신고 시점 작성자 닉네임 스냅샷 */
    @Prop({ type: String, required: true })
    reporterNickname: string;

    @Prop({
        type: String,
        enum: ['spam', 'inappropriate_content', 'false_info', 'hateful_content', 'other'],
        required: true,
    })
    reason: CommunityReportReason;

    @Prop({ type: String, maxlength: 500 })
    description?: string;

    @Prop({
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending',
        index: true,
    })
    status: CommunityReportStatus;

    @Prop({ type: Types.ObjectId })
    resolvedByAdminId?: Types.ObjectId;

    @Prop({ type: Date })
    resolvedAt?: Date;
}

export const CommunityPostReportSchema = SchemaFactory.createForClass(CommunityPostReport);

/** 유저당 게시글 1건만 신고 가능 */
CommunityPostReportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });
/** 관리자 목록 정렬용 */
CommunityPostReportSchema.index({ status: 1, createdAt: -1 });
