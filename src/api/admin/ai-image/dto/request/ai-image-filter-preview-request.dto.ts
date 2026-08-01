import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/** 필터 저장 전에 프롬프트를 즉시 시험해보는 요청 */
export class AiImageFilterPreviewRequestDto {
    @ApiProperty({ description: '변환 프롬프트', example: '16-bit pixel art portrait of the pet' })
    @IsString()
    @IsNotEmpty()
    prompt: string;

    @ApiPropertyOptional({ description: '제외할 요소', example: 'blurry, text, watermark' })
    @IsOptional()
    @IsString()
    negativePrompt?: string;

    @ApiProperty({ description: '테스트할 원본 이미지 파일키', example: 'ai-image/source/abc123.jpg' })
    @IsString()
    @IsNotEmpty()
    inputObjectKey: string;

    @ApiPropertyOptional({ description: '이미지 모델', example: 'gpt-image-1' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiPropertyOptional({ description: '출력 크기', example: '1024x1024' })
    @IsOptional()
    @IsString()
    outputSize?: string;

    @ApiPropertyOptional({ description: '후처리 종류', enum: ['none', 'pixelate'], example: 'pixelate' })
    @IsOptional()
    @IsIn(['none', 'pixelate'])
    postProcessType?: 'none' | 'pixelate';

    @ApiPropertyOptional({ description: '도트 해상도(장축 픽셀 수)', example: 96, minimum: 16, maximum: 512 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(16)
    @Max(512)
    pixelSize?: number;

    @ApiPropertyOptional({ description: '팔레트 색 수', example: 48, minimum: 2, maximum: 256 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2)
    @Max(256)
    paletteSize?: number;
}
