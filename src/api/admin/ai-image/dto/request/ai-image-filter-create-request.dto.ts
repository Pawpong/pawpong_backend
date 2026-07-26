import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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

    @ApiPropertyOptional({ description: '스타일 레퍼런스 이미지 S3 파일키 목록', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    referenceImageObjectKeys?: string[];

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
