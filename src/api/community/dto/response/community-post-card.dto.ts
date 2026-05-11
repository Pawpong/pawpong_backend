import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 커뮤니티 메인 피드 카드 (Figma 21:2).
 */
export class CommunityPostCardResponseDto {
    @ApiProperty({ description: '게시글 ID', example: '507f1f77bcf86cd799439011' })
    postId: string;

    @ApiProperty({ description: '작성자 ID', example: '507f1f77bcf86cd799439022' })
    authorId: string;

    @ApiProperty({ description: '작성자 모델', enum: ['Adopter', 'Breeder'] })
    authorModel: 'Adopter' | 'Breeder';

    @ApiProperty({ description: '작성자 닉네임 (작성 시점 스냅샷)', example: '파이리귀여워' })
    authorNickname: string;

    @ApiPropertyOptional({ description: '작성자 프로필 이미지 signed URL' })
    authorProfileImageUrl?: string;

    @ApiPropertyOptional({ description: '제목', example: '오늘의 파이리' })
    title?: string;

    @ApiProperty({ description: '본문 발췌 (최대 120자)', example: '너무 이쁜 아이가 태어났어요…' })
    bodyExcerpt: string;

    @ApiPropertyOptional({ description: '대표 사진 signed URL (첫 사진)' })
    primaryPhotoUrl?: string;

    @ApiProperty({ description: '사진 signed URL 배열', type: [String] })
    photoUrls: string[];

    @ApiPropertyOptional({ description: '동물 종류', enum: ['dog', 'cat', 'reptile'] })
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({ description: '카테고리 (자유 텍스트)', example: '레오파드' })
    category?: string;

    @ApiProperty({ description: '좋아요 수', example: 10 })
    likeCount: number;

    @ApiProperty({ description: '댓글 수', example: 10 })
    commentCount: number;

    @ApiProperty({ description: '저장 수', example: 2 })
    saveCount: number;

    @ApiProperty({ description: '작성 시각 (ISO 8601)', example: '2026-04-01T10:00:00.000Z' })
    createdAt: string;
}
