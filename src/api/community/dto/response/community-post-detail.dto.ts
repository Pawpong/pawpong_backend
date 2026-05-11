import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CommunityPostCommentResponseDto } from './community-post-comment.dto';

/**
 * 커뮤니티 게시글 상세 (Figma 315:5433).
 *
 * commentPreview 는 첫 페이지(기본 5개) 댓글. 더 보기는 GET /v2/community/posts/:postId/comments 로 페이지네이션.
 */
export class CommunityPostDetailResponseDto {
    @ApiProperty({ description: '게시글 ID' })
    postId: string;

    @ApiProperty({ description: '작성자 ID' })
    authorId: string;

    @ApiProperty({ description: '작성자 모델', enum: ['Adopter', 'Breeder'] })
    authorModel: 'Adopter' | 'Breeder';

    @ApiProperty({ description: '작성자 닉네임' })
    authorNickname: string;

    @ApiPropertyOptional({ description: '작성자 프로필 이미지 signed URL' })
    authorProfileImageUrl?: string;

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
}
