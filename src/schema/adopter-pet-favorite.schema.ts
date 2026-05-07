import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

/**
 * 입양자 ↔ 동물 즐겨찾기 매핑 (v2 입양 페이지 "관심있어요" 토글)
 * v1 의 brand-단위 favorite-breeder 와 별도로, 동물 단위 즐겨찾기를 저장한다.
 */
@Schema({
    collection: 'adopter_pet_favorites',
    timestamps: true,
})
export class AdopterPetFavorite extends Document {
    declare _id: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Adopter', required: true })
    adopterId: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AvailablePet', required: true })
    petId: Types.ObjectId;

    declare createdAt: Date;
    declare updatedAt: Date;
}

export const AdopterPetFavoriteSchema = SchemaFactory.createForClass(AdopterPetFavorite);

// 입양자 + 동물 페어 중복 방지
AdopterPetFavoriteSchema.index({ adopterId: 1, petId: 1 }, { unique: true });

// 입양자별 즐겨찾기 목록 조회 최적화
AdopterPetFavoriteSchema.index({ adopterId: 1, createdAt: -1 });
