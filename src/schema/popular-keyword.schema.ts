import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    collection: 'popular_keywords',
    timestamps: true,
})
export class PopularKeyword extends Document {
    declare _id: Types.ObjectId;

    /**
     * 검색어 (홈 화면 인기 검색어 칩에 노출되는 텍스트)
     */
    @Prop({ required: true, trim: true })
    keyword: string;

    /**
     * 정렬 순서 (낮을수록 상단)
     */
    @Prop({ required: true, default: 0 })
    rank: number;

    /**
     * 활성 여부 (false면 노출 제외)
     */
    @Prop({ required: true, default: true })
    isActive: boolean;

    declare createdAt: Date;
    declare updatedAt: Date;
}

export const PopularKeywordSchema = SchemaFactory.createForClass(PopularKeyword);

// 키워드 중복 등록 방지
PopularKeywordSchema.index({ keyword: 1 }, { unique: true });

// 활성 + 정렬 순서 조회 최적화
PopularKeywordSchema.index({ isActive: 1, rank: 1 });
