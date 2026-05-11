import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommunityPostCommentResponseDto {
    @ApiProperty({ description: '댓글 ID', example: '507f1f77bcf86cd799439055' })
    commentId: string;

    @ApiProperty({ description: '게시글 ID' })
    postId: string;

    @ApiProperty({ description: '작성자 ID' })
    authorId: string;

    @ApiProperty({ description: '작성자 모델', enum: ['Adopter', 'Breeder'] })
    authorModel: 'Adopter' | 'Breeder';

    @ApiProperty({ description: '작성자 닉네임', example: '파이리귀여워' })
    authorNickname: string;

    @ApiPropertyOptional({ description: '작성자 프로필 이미지 signed URL' })
    authorProfileImageUrl?: string;

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
