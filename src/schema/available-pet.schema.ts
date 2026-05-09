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

    /**
     * v2 분양글 — photos 배열 내 대표 사진 인덱스
     * 0 부터 시작하며 photos.length 미만이어야 한다.
     */
    @Prop({ type: Number, default: 0 })
    representativePhotoIndex?: number;

    /**
     * v2 분양글 — 예방 접종 상태 ('completed' | 'incomplete')
     * incomplete 인 경우 vaccinationIncompleteReason 필수, vaccinationRecords 비어있어야 한다.
     */
    @Prop({ type: String, enum: ['completed', 'incomplete'] })
    vaccinationStatus?: 'completed' | 'incomplete';

    /**
     * v2 분양글 — 예방 접종 기록 (다회차)
     * vaccinationStatus = 'completed' 인 경우에만 채워진다.
     */
    @Prop({
        type: [
            {
                _id: false,
                name: { type: String, required: true },
                date: { type: Date, required: true },
                round: { type: Number, required: true, min: 1 },
            },
        ],
        default: [],
    })
    vaccinationRecords?: Array<{ name: string; date: Date; round: number }>;

    /**
     * v2 분양글 — 예방 접종 미완료 사유
     * vaccinationStatus = 'incomplete' 인 경우에만 채워진다.
     */
    @Prop({ type: String, maxlength: 500 })
    vaccinationIncompleteReason?: string;

    /**
     * v2 분양글 — 유전병 검사 상태 ('completed' | 'incomplete')
     */
    @Prop({ type: String, enum: ['completed', 'incomplete'] })
    geneticTestStatus?: 'completed' | 'incomplete';

    /**
     * v2 분양글 — 유전병 검사 기록 (다회차)
     * geneticTestStatus = 'completed' 인 경우에만 채워진다.
     */
    @Prop({
        type: [
            {
                _id: false,
                date: { type: Date, required: true },
                institution: { type: String, required: true },
                testName: { type: String, required: true },
                result: { type: String, required: true },
            },
        ],
        default: [],
    })
    geneticTestRecords?: Array<{ date: Date; institution: string; testName: string; result: string }>;

    /**
     * v2 분양글 — 유전병 검사 미완료 사유
     */
    @Prop({ type: String, maxlength: 500 })
    geneticTestIncompleteReason?: string;

    /**
     * v2 분양글 — 부모 정보 스냅샷 (분양글 작성 시 inline 입력)
     * ParentPet 도큐먼트 참조(parentInfo) 와 별개로,
     * 분양글 폼에서 입력한 단순 부모 정보를 그대로 보존한다 (관계/품종/이름/생년월일/사진).
     */
    @Prop({
        type: [
            {
                _id: false,
                relation: { type: String, enum: ['mother', 'father'], required: true },
                breed: { type: String, required: true },
                name: { type: String, required: true },
                birthDate: { type: Date },
                photoFileName: { type: String },
            },
        ],
        default: [],
    })
    parentPetSnapshots?: Array<{
        relation: 'mother' | 'father';
        breed: string;
        name: string;
        birthDate?: Date;
        photoFileName?: string;
    }>;

    /**
     * v2 분양글 — 사육 환경 정보 (description + 사진 1장)
     */
    @Prop({
        type: {
            _id: false,
            description: { type: String, maxlength: 1000 },
            photoFileName: { type: String },
        },
    })
    breedingEnvironment?: {
        description?: string;
        photoFileName?: string;
    };
}

export const AvailablePetSchema = SchemaFactory.createForClass(AvailablePet);

// 인덱스 설정
AvailablePetSchema.index({ breederId: 1, isActive: 1, status: 1 });
AvailablePetSchema.index({ breederId: 1, breed: 1 });
AvailablePetSchema.index({ status: 1, price: 1 });

// v2 입양 페이지 — petType + status + isActive 필터 + 정렬용 인덱스
AvailablePetSchema.index({ petType: 1, status: 1, isActive: 1, createdAt: -1 });
AvailablePetSchema.index({ petType: 1, status: 1, isActive: 1, favoriteCount: -1 });
