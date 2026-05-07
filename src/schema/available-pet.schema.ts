import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AvailablePetDocument = AvailablePet &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * 분양 가능한 반려동물 정보 스키마
 * 프로필 페이지 표시: 사진 / 이름 / 생년월일 / 가격 / 품종 / 입양상태 / 소개 / 부모묘
 */
@Schema({
    timestamps: true,
    collection: 'available_pets',
})
export class AvailablePet {
    /**
     * 브리더 ID (참조)
     */
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Breeder', required: true, index: true })
    breederId: MongooseSchema.Types.ObjectId;

    /**
     * 분양 개체 이름
     */
    @Prop({ required: true })
    name: string;

    /**
     * 품종명
     */
    @Prop({ required: true })
    breed: string;

    /**
     * 성별 (male: 수컷, female: 암컷)
     */
    @Prop({ required: true, enum: ['male', 'female'] })
    gender: string;

    /**
     * 출생일
     */
    @Prop({ required: true })
    birthDate: Date;

    /**
     * 분양 가격 (원)
     */
    @Prop({ required: true })
    price: number;

    /**
     * 분양 상태 (available: 분양가능, reserved: 예약됨, adopted: 분양완료)
     */
    @Prop({ required: true, enum: ['available', 'reserved', 'adopted'], default: 'available' })
    status: string;

    /**
     * 분양 개체 사진 파일명 배열 (버킷에서 조회)
     */
    @Prop({ type: [String], default: [] })
    photos: string[];

    /**
     * 분양 개체 소개
     */
    @Prop({ maxlength: 500 })
    description?: string;

    /**
     * 부모묘 정보 (ParentPet ID 참조)
     */
    @Prop({
        type: {
            mother: { type: MongooseSchema.Types.ObjectId, ref: 'ParentPet' },
            father: { type: MongooseSchema.Types.ObjectId, ref: 'ParentPet' },
        },
    })
    parentInfo?: {
        mother?: MongooseSchema.Types.ObjectId;
        father?: MongooseSchema.Types.ObjectId;
    };

    /**
     * 활성 상태 여부 (삭제된 항목은 false)
     */
    @Prop({ default: true })
    isActive: boolean;

    /**
     * 분양 완료 일시
     */
    @Prop()
    adoptedAt?: Date;

    /**
     * 예약 일시
     */
    @Prop()
    reservedAt?: Date;

    /**
     * 입양 페이지 카드 통계 — 문의 수
     * 상담 신청 생성 시 도메인 이벤트로 증가시킨다.
     */
    @Prop({ type: Number, default: 0 })
    inquiryCount: number;

    /**
     * 입양 페이지 카드 통계 — 관심 등록 수
     * adopter-pet-favorite 추가/제거 시 도메인 이벤트로 증감한다.
     */
    @Prop({ type: Number, default: 0 })
    favoriteCount: number;

    /**
     * 입양 페이지 카드 통계 — 조회 수
     * 상세 페이지 진입 시 증가시킨다.
     */
    @Prop({ type: Number, default: 0 })
    viewCount: number;

    /**
     * 동물 종류 (강아지/고양이/도마뱀)
     * 입양 페이지 카테고리 탭 필터링용.
     * 기존 데이터 호환을 위해 optional 로 선언한다 (마이그레이션 시 채움).
     */
    @Prop({ type: String, enum: ['dog', 'cat', 'reptile'] })
    petType?: 'dog' | 'cat' | 'reptile';
}

export const AvailablePetSchema = SchemaFactory.createForClass(AvailablePet);

// 인덱스 설정
AvailablePetSchema.index({ breederId: 1, isActive: 1, status: 1 });
AvailablePetSchema.index({ breederId: 1, breed: 1 });
AvailablePetSchema.index({ status: 1, price: 1 });

// v2 입양 페이지 — petType + status + isActive 필터 + 정렬용 인덱스
AvailablePetSchema.index({ petType: 1, status: 1, isActive: 1, createdAt: -1 });
AvailablePetSchema.index({ petType: 1, status: 1, isActive: 1, favoriteCount: -1 });
