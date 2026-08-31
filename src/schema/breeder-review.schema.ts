import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BreederReviewDocument = BreederReview & Document;

/**
 * 브리더 후기 스키마
 *
 * 참조 방식으로 설계:
 * - 별도 컬렉션으로만 관리 (임베디드 없음)
 * - 입양 신청과 연결하여 상담 완료 또는 입양 승인 후 작성 가능
 * - 조회 시 populate로 추가 정보 가져오기
 */
@Schema({
    timestamps: true,
    collection: 'breeder_reviews',
})
export class BreederReview {
    /**
     * 입양 신청 ID (참조)
     * 신청 한 건당 한 번만 작성하는 후기이므로 신청과 1:1 매칭
     */
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AdoptionApplication', required: true })
    applicationId: MongooseSchema.Types.ObjectId;

    /**
     * 브리더 ID (참조)
     */
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Breeder', required: true, index: true })
    breederId: MongooseSchema.Types.ObjectId;

    /**
     * 후기 작성자 (입양자) ID (참조)
     */
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Adopter', required: true, index: true })
    adopterId: MongooseSchema.Types.ObjectId;

    /**
     * 후기 유형
     * - consultation: 상담후기
     * - adoption: 입양완료후기
     */
    @Prop({ required: true, enum: ['consultation', 'adoption'], index: true })
    type: string;

    /**
     * 후기 내용
     */
    @Prop({ required: true })
    content: string;

    /**
     * 후기 작성 일시
     */
    @Prop({ required: true, default: Date.now, index: true })
    writtenAt: Date;

    /**
     * 공개 여부 (숨김 처리, 신고 처리 등에 사용)
     */
    @Prop({ default: true })
    isVisible: boolean;

    /**
     * 신고 여부
     */
    @Prop({ default: false })
    isReported: boolean;

    /**
     * 신고자 ID
     */
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Adopter' })
    reportedBy?: MongooseSchema.Types.ObjectId;

    /**
     * 신고 사유
     */
    @Prop()
    reportReason?: string;

    /**
     * 신고 상세 설명
     */
    @Prop()
    reportDescription?: string;

    /**
     * 신고 일시
     */
    @Prop()
    reportedAt?: Date;

    /**
     * 브리더 답글 내용
     */
    @Prop()
    replyContent?: string;

    /**
     * 브리더 답글 작성 일시
     */
    @Prop()
    replyWrittenAt?: Date;

    /**
     * 브리더 답글 수정 일시
     */
    @Prop()
    replyUpdatedAt?: Date;
}

export const BreederReviewSchema = SchemaFactory.createForClass(BreederReview);

// 인덱스 설정
// 기존 dev 데이터에 중복 신청 후기 1건이 남아 있어 DB 유니크 인덱스는 정리 마이그레이션 뒤 적용한다.
// 애플리케이션 계층에서는 생성 전에 중복을 차단한다.
BreederReviewSchema.index({ applicationId: 1 });
BreederReviewSchema.index({ breederId: 1, isVisible: 1, writtenAt: -1 }); // 브리더별 최신 후기 조회
BreederReviewSchema.index({ adopterId: 1, writtenAt: -1 }); // 입양자별 작성 후기 조회
BreederReviewSchema.index({ breederId: 1, type: 1 }); // 브리더별 후기 타입 필터링
