import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CommunityAuthorResponseDto } from './community-post-card.dto';
import { CommunityPostCommentResponseDto } from './community-post-comment.dto';

/**
 * 커뮤니티 게시글 상세 (Figma 315:5433).
 *
 * commentPreview 는 첫 페이지(기본 5개) 댓글. 더 보기는 GET /v2/community/posts/:postId/comments 로 페이지네이션.
 */
export class CommunityPostDetailResponseDto {
    @ApiProperty({ description: '게시글 ID' })
    postId: string;

    @ApiProperty({ description: '작성자 요약 정보 (마이홈 연결용)', type: CommunityAuthorResponseDto })
    author: CommunityAuthorResponseDto;

    @ApiProperty({ description: '작성자 모델 (마이홈 라우팅용)', enum: ['Adopter', 'Breeder'] })
    authorModel: 'Adopter' | 'Breeder';

    @ApiPropertyOptional({ description: '제목' })
    title?: string;

    @ApiProperty({ description: '본문 전문' })
    body: string;

    @ApiProperty({ description: '사진 signed URL 배열', type: [String] })
    photoUrls: string[];

    @ApiPropertyOptional({ description: '동물 종류', enum: ['dog', 'cat', 'reptile'] })
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({ description: '카테고리' })
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

    @ApiProperty({ description: '좋아요 수' })
    likeCount: number;

    @ApiProperty({ description: '댓글 수' })
    commentCount: number;

    @ApiProperty({ description: '저장 수' })
    saveCount: number;

    @ApiProperty({ description: '조회 수' })
    viewCount: number;

    @ApiProperty({ description: '작성 시각 (ISO 8601)' })
    createdAt: string;

    @ApiProperty({
        description: '댓글 첫 페이지 (기본 5개, 더 보기는 별도 페이지네이션 endpoint)',
        type: [CommunityPostCommentResponseDto],
    })
    commentPreview: CommunityPostCommentResponseDto[];

    @ApiProperty({ description: '현재 요청 사용자의 좋아요 여부 (비인증 시 false)', example: false })
    isLiked: boolean;

    @ApiProperty({ description: '현재 요청 사용자의 저장 여부 (비인증 시 false)', example: false })
    isSaved: boolean;
}
