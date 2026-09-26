import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class AiImageFilterCreateRequestDto {
    @ApiProperty({ description: '필터명 (사용자 노출)', example: '포근한 버섯 상점' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @ApiPropertyOptional({ description: '필터 설명', example: '반려동물을 버섯 가게 주인으로' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;

    @ApiPropertyOptional({ description: '썸네일 S3 파일키', example: 'ai-image/filter/uuid.png' })
    @IsOptional()
    @IsString()
    thumbnailFileName?: string;

    @ApiProperty({ description: '이미지 변환 프롬프트 (사용자에게 노출되지 않음)' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    prompt: string;

    @ApiPropertyOptional({ description: '제외할 요소 프롬프트' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    negativePrompt?: string;

    @ApiProperty({ description: '사용할 이미지 모델', example: 'gpt-image-1' })
    @IsString()
    @IsNotEmpty()
    model: string;

    @ApiPropertyOptional({ description: '출력 크기', example: '1024x1024' })
    @IsOptional()
    @IsString()
    outputSize?: string;

    @ApiPropertyOptional({ description: '스타일 레퍼런스 이미지 S3 파일키 목록 (최대 4장)', type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(4)
    @IsString({ each: true })
    referenceImageObjectKeys?: string[];

    @ApiPropertyOptional({ description: '생성 후처리 (기본 pixelate — 포퐁 도트 콘셉트)', enum: ['none', 'pixelate'] })
    @IsOptional()
    @IsIn(['none', 'pixelate'])
    postProcessType?: 'none' | 'pixelate';

    @ApiPropertyOptional({ description: '도트 해상도(장축 픽셀 수)', example: 96, minimum: 16, maximum: 512 })
    @IsOptional()
    @IsInt()
    @Min(16)
    @Max(512)
    pixelSize?: number;

    @ApiPropertyOptional({ description: '팔레트 색 수', example: 48, minimum: 2, maximum: 256 })
    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(256)
    paletteSize?: number;

    @ApiPropertyOptional({ description: '원본 보존 강도 (high: 얼굴·무늬 보존↑, 비용↑)', enum: ['low', 'high'] })
    @IsOptional()
    @IsIn(['low', 'high'])
    inputFidelity?: 'low' | 'high';

    @ApiPropertyOptional({ description: '사용자 노출 여부', example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ description: '목록 정렬 순서 (오름차순)', example: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
