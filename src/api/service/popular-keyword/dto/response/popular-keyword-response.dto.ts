import { ApiProperty } from '@nestjs/swagger';

/**
 * 인기 검색어 응답 DTO
 */
export class PopularKeywordResponseDto {
    @ApiProperty({
        description: '인기 검색어 ID',
        example: '507f1f77bcf86cd799439011',
    })
    keywordId: string;

    @ApiProperty({
        description: '검색어 텍스트',
        example: '비숑',
    })
    keyword: string;

    @ApiProperty({
        description: '정렬 순서 (낮을수록 상단)',
        example: 0,
    })
    rank: number;

    @ApiProperty({
        description: '활성 여부',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: '생성일',
        example: '2025-01-14T10:30:00.000Z',
    })
    createdAt: string;

    @ApiProperty({
        description: '수정일',
        example: '2025-01-14T10:30:00.000Z',
    })
    updatedAt: string;
}
