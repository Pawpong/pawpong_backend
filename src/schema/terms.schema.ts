import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TermsCode =
    | 'service'
    | 'privacy'
    | 'marketing'
    | 'age_14plus'
    | 'counsel_privacy';

@Schema({
    collection: 'terms',
    timestamps: true,
})
export class Terms extends Document {
    declare _id: Types.ObjectId;

    /**
     * 약관 코드 (가입/동의 흐름에서 식별자)
     * - service: 서비스 이용약관
     * - privacy: 개인정보 수집 및 이용 동의
     * - marketing: 마케팅 활용 동의
     * - age_14plus: 만 14세 이상 확인
     * - counsel_privacy: 입양 상담용 개인정보 수집 동의
     */
    @Prop({
        type: String,
        required: true,
        enum: ['service', 'privacy', 'marketing', 'age_14plus', 'counsel_privacy'],
    })
    code: TermsCode;

    /**
     * 약관 버전 (코드 단위로 활성 버전이 1개여야 함)
     * 예: "v1.0", "2025-01-15"
     */
    @Prop({ required: true, trim: true })
    version: string;

    /**
     * 약관 제목 (목록 노출용)
     */
    @Prop({ required: true, trim: true })
    title: string;

    /**
     * 약관 본문 (markdown 또는 html)
     */
    @Prop({ required: true })
    body: string;

    /**
     * 필수 동의 여부 (가입 시 false면 통과 불가)
     */
    @Prop({ required: true, default: true })
    isRequired: boolean;

    /**
     * 활성 여부 (코드별로 1개 활성 버전만 존재)
     */
    @Prop({ required: true, default: false })
    isActive: boolean;

    /**
     * 활성화 시점 (이 버전이 적용되기 시작한 시간)
     */
    @Prop({ type: Date })
    activatedAt?: Date;

    declare createdAt: Date;
    declare updatedAt: Date;
}

export const TermsSchema = SchemaFactory.createForClass(Terms);

// 코드 + 버전은 유일해야 함 (중복 등록 방지)
TermsSchema.index({ code: 1, version: 1 }, { unique: true });

// 코드별 활성 버전 조회 최적화
TermsSchema.index({ code: 1, isActive: 1 });
