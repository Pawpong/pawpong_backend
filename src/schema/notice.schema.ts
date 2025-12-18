import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * 공지사항 스키마
 * 관리자가 작성하는 공지사항을 저장
 */
@Schema({
    collection: 'notices',
    timestamps: true, // createdAt, updatedAt 자동 생성
})
export class Notice extends Document {
    /**
     * 공지사항 고유 ID (MongoDB 자동 생성)
     */
    declare _id: Types.ObjectId;

    /**
     * 공지사항 제목
     */
    @Prop({ required: true, trim: true })
    title: string;

    /**
     * 공지사항 내용
     */
    @Prop({ required: true })
    content: string;

    /**
     * 작성자 (관리자) ID
     */
    @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
    authorId: Types.ObjectId;

    /**
     * 작성자 이름 (캐시)
     */
    @Prop({ required: true })
    authorName: string;

    /**
     * 공지사항 상태
     * - published: 게시됨
     * - draft: 임시저장
     * - archived: 보관됨
     */
    @Prop({
        type: String,
        enum: ['published', 'draft', 'archived'],
        default: 'published',
    })
    status: 'published' | 'draft' | 'archived';

    /**
     * 중요 공지 여부 (상단 고정)
     */
    @Prop({ default: false })
    isPinned: boolean;

    /**
     * 조회수
     */
    @Prop({ default: 0 })
    viewCount: number;

    /**
     * 게시 시작일 (선택)
     */
    @Prop({ type: Date })
    publishedAt?: Date;

    /**
     * 게시 종료일 (선택)
     */
    @Prop({ type: Date })
    expiredAt?: Date;

    /**
     * 생성일
     */
    createdAt: Date;

    /**
     * 수정일
     */
    updatedAt: Date;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);

// 인덱스 설정
NoticeSchema.index({ status: 1, createdAt: -1 }); // 상태별 최신순 조회
NoticeSchema.index({ isPinned: 1, createdAt: -1 }); // 고정 공지 조회
NoticeSchema.index({ title: 'text', content: 'text' }); // 전문 검색
