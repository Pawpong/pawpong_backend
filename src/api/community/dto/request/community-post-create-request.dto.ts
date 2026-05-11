import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommunityPostRequestDto {
    @ApiPropertyOptional({ description: '제목 (선택, ≤100)', example: '오늘의 파이리' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;

    @ApiProperty({ description: '본문 (≤2000, trim 후 비어있을 수 없음)', example: '너무 이쁜 아이가 태어났어요...' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    body: string;

    @ApiPropertyOptional({
        description: '사진 파일명 배열 (≤10). upload 모듈에서 미리 업로드된 파일명만 받음',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    photos?: string[];

    @ApiPropertyOptional({ description: '동물 종류', enum: ['dog', 'cat', 'reptile'] })
    @IsOptional()
    @IsEnum(['dog', 'cat', 'reptile'])
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({ description: '자유 카테고리 텍스트 (≤50)', example: '레오파드' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    category?: string;
}
