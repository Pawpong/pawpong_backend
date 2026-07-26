import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CommunityAuthorResponseDto } from './community-author.dto';
import { CommunityPostCommentResponseDto } from './community-post-comment.dto';

// 기존 import 경로(`from './community-post-card.dto'`)를 쓰던 곳이 깨지지 않도록 재노출한다
export { CommunityAuthorResponseDto };

/**
 * 커뮤니티 메인 피드 카드 (Figma 21:2).
 */
export class CommunityPostCardResponseDto {
    @ApiProperty({ description: '게시글 ID', example: '507f1f77bcf86cd799439011' })
    postId: string;

    @ApiProperty({ description: '작성자 요약 정보 (마이홈 연결용)', type: CommunityAuthorResponseDto })
    author: CommunityAuthorResponseDto;

    @ApiProperty({ description: '작성자 모델 (마이홈 라우팅용)', enum: ['Adopter', 'Breeder'] })
    authorModel: 'Adopter' | 'Breeder';

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

    @ApiProperty({
        description: '공개 범위 (public=전체공개, followers=팔로워공개, private=나만보기)',
        enum: ['public', 'followers', 'private'],
        example: 'public',
    })
    visibility: 'public' | 'followers' | 'private';

    @ApiProperty({
        description: '발행 상태 (published=발행, draft=임시저장)',
        enum: ['draft', 'published'],
        example: 'published',
    })
    status: 'draft' | 'published';

    @ApiProperty({ description: '좋아요 수', example: 10 })
    likeCount: number;

    @ApiProperty({ description: '댓글 수', example: 10 })
    commentCount: number;

    @ApiProperty({ description: '저장 수', example: 2 })
    saveCount: number;

    @ApiProperty({ description: '작성 시각 (ISO 8601)', example: '2026-04-01T10:00:00.000Z' })
    createdAt: string;

    @ApiProperty({
        description:
            '카드에 노출할 최신 댓글 (없으면 빈 배열). 상세 응답과 같은 형태이며 카드에서는 최신 1건만 담긴다. 카드마다 상세를 다시 호출하지 않도록 목록 응답에 포함한다.',
        type: [CommunityPostCommentResponseDto],
    })
    commentPreview: CommunityPostCommentResponseDto[];

    @ApiProperty({ description: '현재 요청 사용자의 좋아요 여부 (비인증 시 false)', example: false })
    isLiked: boolean;

    @ApiProperty({ description: '현재 요청 사용자의 저장 여부 (비인증 시 false)', example: false })
    isSaved: boolean;
}
