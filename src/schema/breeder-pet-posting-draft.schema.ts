import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type BreederPetPostingDraftDocument = BreederPetPostingDraft &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * v2 분양글 임시저장 (draft).
 *
 * 작성 중인 폼 상태를 그대로 보관하는 별도 컬렉션.
 * available_pets 와 분리한 이유:
 * - 분양글 스키마는 required 필드가 많아 미완성 상태를 담을 수 없다
 * - 입양 페이지/프로필 조회 쿼리에 draft 가 새어 나갈 위험을 구조적으로 차단한다
 *
 * form 은 작성 화면의 payload 를 그대로 저장한다 (모든 필드 미완성 허용).
 * 등록 시 일반 분양글 작성 API 로 제출하고 draft 는 삭제된다.
 */
@Schema({ timestamps: true, collection: 'breeder_pet_posting_drafts' })
export class BreederPetPostingDraft {
    /** 작성 중인 브리더 ID */
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Breeder', required: true, index: true })
    breederId: MongooseSchema.Types.ObjectId;

    /** 작성 중 폼 상태 (분양글 작성 요청과 동일 shape, 전 필드 옵션) */
    @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
    form: Record<string, unknown>;
}

export const BreederPetPostingDraftSchema = SchemaFactory.createForClass(BreederPetPostingDraft);

/** 내 임시저장 목록 조회 (최신순) */
BreederPetPostingDraftSchema.index({ breederId: 1, updatedAt: -1 });
