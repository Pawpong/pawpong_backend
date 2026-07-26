import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CommunityAuthorResponseDto } from './community-post-card.dto';

export class CommunityPostCommentResponseDto {
    @ApiProperty({ description: '댓글 ID', example: '507f1f77bcf86cd799439055' })
    commentId: string;

    @ApiProperty({ description: '게시글 ID' })
    postId: string;

    @ApiProperty({ description: '작성자 요약 정보 (마이홈 연결용)', type: CommunityAuthorResponseDto })
    author: CommunityAuthorResponseDto;

    @ApiProperty({ description: '작성자 모델 (마이홈 라우팅용)', enum: ['Adopter', 'Breeder'] })
    authorModel: 'Adopter' | 'Breeder';

    @ApiPropertyOptional({
        description: '부모 댓글 ID (대댓글일 때만, 최상위 댓글은 null)',
        example: '507f1f77bcf86cd799439044',
        nullable: true,
    })
    parentCommentId: string | null;

    @ApiProperty({ description: '댓글 본문', example: '너무 귀엽네요!' })
    body: string;

    @ApiProperty({ description: '좋아요 수', example: 0 })
    likeCount: number;

    @ApiProperty({ description: '작성 시각 (ISO 8601)', example: '2026-04-01T11:00:00.000Z' })
    createdAt: string;
}
