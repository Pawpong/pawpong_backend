import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * 문의 답변 서브도큐먼트
 * 브리더가 작성한 답변 (임베딩 구조)
 */
@Schema({ _id: true, timestamps: false })
export class InquiryAnswer {
    /**
     * 답변 고유 ID
     */
    declare _id: Types.ObjectId;

    /**
     * 답변 작성 브리더 ID
     */
    @Prop({ type: Types.ObjectId, ref: 'Breeder', required: true })
    breederId: Types.ObjectId;

    /**
     * 브리더 이름 (캐시)
     */
    @Prop({ required: true })
    breederName: string;

    /**
     * 브리더 프로필 이미지 URL (캐시)
     */
    @Prop()
    profileImageUrl?: string;

    /**
     * 답변 내용
     */
    @Prop({ required: true })
    content: string;

    /**
     * 답변 작성 시간
     */
    @Prop({ type: Date, default: Date.now })
    answeredAt: Date;
}

export const InquiryAnswerSchema = SchemaFactory.createForClass(InquiryAnswer);

/**
 * 문의 스키마
 * 입양자가 작성하는 질문, 브리더가 답변
 */
@Schema({
    collection: 'inquiries',
    timestamps: true,
})
export class Inquiry extends Document {
    /**
     * 문의 고유 ID
     */
    declare _id: Types.ObjectId;

    /**
     * 작성자 (입양자) ID
     */
    @Prop({ type: Types.ObjectId, ref: 'Adopter', required: true })
    authorId: Types.ObjectId;

    /**
     * 작성자 닉네임 (캐시)
     */
    @Prop({ required: true })
    authorNickname: string;

    /**
     * 질문 제목
     */
    @Prop({ required: true, trim: true })
    title: string;

    /**
     * 질문 내용
     */
    @Prop({ required: true })
    content: string;

    /**
     * 질문 유형
     * - common: 공통 질문 (모든 브리더에게 공개)
     * - direct: 1:1 질문 (특정 브리더에게만 공개)
     */
    @Prop({
        type: String,
        enum: ['common', 'direct'],
        required: true,
    })
    type: 'common' | 'direct';

    /**
     * 반려동물 종류
     */
    @Prop({
        type: String,
        enum: ['dog', 'cat'],
        required: true,
    })
    animalType: 'dog' | 'cat';

    /**
     * 1:1 질문 대상 브리더 ID (type이 direct인 경우 필수)
     */
    @Prop({ type: Types.ObjectId, ref: 'Breeder' })
    targetBreederId?: Types.ObjectId;

    /**
     * 첨부 이미지 URL 배열 (최대 4장)
     */
    @Prop({ type: [String], default: [] })
    imageUrls: string[];

    /**
     * 조회수
     */
    @Prop({ default: 0 })
    viewCount: number;

    /**
     * 답변 배열 (임베딩)
     */
    @Prop({ type: [InquiryAnswerSchema], default: [] })
    answers: InquiryAnswer[];

    /**
     * 문의 상태
     * - active: 활성 (답변 가능)
     * - closed: 종료 (답변 불가)
     */
    @Prop({
        type: String,
        enum: ['active', 'closed'],
        default: 'active',
    })
    status: 'active' | 'closed';

    /**
     * 최신 답변 시간 (정렬용 캐시)
     */
    @Prop({ type: Date })
    latestAnsweredAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export type InquiryDocument = Inquiry & Document;

export const InquirySchema = SchemaFactory.createForClass(Inquiry);

// 인덱스: 목록 조회 최적화
InquirySchema.index({ type: 1, animalType: 1, createdAt: -1 });
InquirySchema.index({ type: 1, animalType: 1, latestAnsweredAt: -1 });
InquirySchema.index({ type: 1, animalType: 1, viewCount: -1 });
InquirySchema.index({ targetBreederId: 1, createdAt: -1 });
InquirySchema.index({ authorId: 1, createdAt: -1 });
