import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

/**
 * 공지사항 스키마
 * 홈페이지에 표시되는 공지사항
 */
@Schema({
    collection: 'announcements',
    timestamps: true,
    versionKey: false,
})
export class Announcement {
    _id: Types.ObjectId;

    /**
     * 공지사항 제목
     */
    @Prop({ required: true, type: String })
    title: string;

    /**
     * 공지사항 내용
     */
    @Prop({ required: true, type: String })
    content: string;

    /**
     * 활성화 여부
     * true: 홈페이지에 노출
     * false: 비활성화 (관리자만 볼 수 있음)
     */
    @Prop({ required: true, type: Boolean, default: true })
    isActive: boolean;

    /**
     * 정렬 순서
     * 낮은 숫자가 먼저 표시됨
     */
    @Prop({ required: true, type: Number, default: 0 })
    order: number;

    /**
     * 등록 일시
     */
    createdAt: Date;

    /**
     * 수정 일시
     */
    updatedAt: Date;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

// 인덱스 설정
AnnouncementSchema.index({ isActive: 1, order: 1, createdAt: -1 });
AnnouncementSchema.index({ createdAt: -1 });
