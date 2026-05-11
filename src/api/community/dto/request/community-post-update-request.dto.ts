import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 게시글 수정 — 모든 필드 optional. 도메인 validator 가 "최소 한 필드 + 본문 비울 수 없음" 강제.
 */
export class UpdateCommunityPostRequestDto {
    @ApiPropertyOptional({ description: '제목 (≤100)', example: '수정된 제목' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;

    @ApiPropertyOptional({ description: '본문 (≤2000)' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    body?: string;

    @ApiPropertyOptional({ description: '사진 파일명 배열 (≤10)', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    photos?: string[];

    @ApiPropertyOptional({ description: '동물 종류', enum: ['dog', 'cat', 'reptile'] })
    @IsOptional()
    @IsEnum(['dog', 'cat', 'reptile'])
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({ description: '자유 카테고리 텍스트 (≤50)' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    category?: string;
}
