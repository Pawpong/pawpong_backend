import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class AiImageGenerationRequestDto {
    @ApiProperty({ description: '사용할 AI 필터 ID', example: '507f1f77bcf86cd799439011' })
    @IsMongoId()
    filterId: string;

    @ApiProperty({
        description: 'upload-url 로 업로드한 원본 사진 파일키',
        example: 'ai-image/source/uuid.jpg',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^ai-image\/source\/.+\.(jpg|png|webp)$/, {
        message: '올바르지 않은 원본 파일키입니다.',
    })
    inputObjectKey: string;

    @ApiPropertyOptional({ description: '대상 콘테스트 ID (생성 횟수 산정 기준)', example: '507f1f77bcf86cd799439012' })
    @IsOptional()
    @IsMongoId()
    contestId?: string;
}
