import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AiImageFilterDocument = AiImageFilter &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * AI 이미지 필터 (관리자가 등록하는 변환 스타일).
 *
 * 사용자는 필터를 골라 사진을 변환하고, 결과를 콘테스트에 출품한다.
 * 프롬프트/모델은 생성 작업 시점에 Job 으로 스냅샷 복사되므로,
 * 여기서 값을 바꿔도 진행 중인 작업의 결과는 바뀌지 않는다.
 */
@Schema({ timestamps: true, collection: 'ai_image_filters' })
export class AiImageFilter {
    /** 사용자에게 보이는 필터명 (예: 포근한 버섯 상점) */
    @Prop({ required: true })
    name: string;

    /** 필터 설명 (선택 화면 보조 문구) */
    @Prop({ default: '' })
    description: string;

    /** 필터 썸네일 S3 파일키 */
    @Prop({ type: String, default: null })
    thumbnailFileName: string | null;

    /** 이미지 변환 프롬프트 (관리자 작성) */
    @Prop({ required: true })
    prompt: string;

    /** 제외할 요소 프롬프트 (선택) */
    @Prop({ default: '' })
    negativePrompt: string;

    /** 사용할 이미지 모델명 (관리자 선택) */
    @Prop({ required: true })
    model: string;

    /** 출력 크기 (예: 1024x1024) */
    @Prop({ default: '1024x1024' })
    outputSize: string;

    /** 스타일 참고용 레퍼런스 이미지 S3 파일키 목록 */
    @Prop({ type: [String], default: [] })
    referenceImageObjectKeys: string[];

    /**
     * 생성 후처리. 포퐁 콘셉트가 도트 그림이라 기본값은 pixelate 다.
     * 모델이 만든 '도트 느낌' 이미지를 실제 픽셀 격자로 스냅시켜 결과물 톤을 통일한다.
     */
    @Prop({ type: String, enum: ['none', 'pixelate'], default: 'pixelate' })
    postProcessType: 'none' | 'pixelate';

    /** 도트 해상도 (축소 후 장축 픽셀 수, 낮을수록 굵은 도트) */
    @Prop({ default: 96 })
    pixelSize: number;

    /** 도트 팔레트 색 수 (낮을수록 레트로) */
    @Prop({ default: 48 })
    paletteSize: number;

    /**
     * 원본 보존 강도. high 는 반려동물의 얼굴·털 무늬를 더 강하게 살린다(OpenAI 비용 증가).
     * "우리 아이"가 알아볼 수 있어야 하는 콘테스트 특성상 기본값은 high 다.
     */
    @Prop({ type: String, enum: ['low', 'high'], default: 'high' })
    inputFidelity: 'low' | 'high';

    /** 사용자 노출 여부 (false 면 목록에서 제외) */
    @Prop({ default: true, index: true })
    isActive: boolean;

    /** 목록 정렬 순서 (오름차순) */
    @Prop({ default: 0 })
    sortOrder: number;
}

export const AiImageFilterSchema = SchemaFactory.createForClass(AiImageFilter);

/** 사용자 필터 목록 조회 (활성 필터를 정렬 순서대로) */
AiImageFilterSchema.index({ isActive: 1, sortOrder: 1 });
