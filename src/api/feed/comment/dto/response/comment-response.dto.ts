import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 댓글 작성자 정보
 */
class CommentAuthorDto {
    @ApiProperty({ description: '사용자 ID' })
    _id: string;

    @ApiProperty({ description: '사용자 이름' })
    name: string;

    @ApiPropertyOptional({ description: '프로필 이미지' })
    profileImageFileName?: string;

    @ApiPropertyOptional({ description: '업체명 (브리더인 경우)' })
    businessName?: string;
}

/**
 * 댓글 응답 DTO
 */
export class CommentResponseDto {
    @ApiProperty({ description: '댓글 ID' })
    commentId: string;

    @ApiProperty({ description: '댓글 내용' })
    content: string;

    @ApiProperty({ description: '작성자 정보', type: CommentAuthorDto })
    author: CommentAuthorDto;

    @ApiPropertyOptional({ description: '부모 댓글 ID (대댓글인 경우)' })
    parentId?: string;

    @ApiProperty({ description: '좋아요 수' })
    likeCount: number;

    @ApiProperty({ description: '대댓글 수' })
    replyCount: number;

    @ApiProperty({ description: '작성일' })
    createdAt: Date;

    @ApiProperty({ description: '내가 작성한 댓글인지 여부' })
    isOwner: boolean;
}

/**
 * 댓글 목록 응답 DTO
 */
export class CommentListResponseDto {
    @ApiProperty({ description: '댓글 목록', type: [CommentResponseDto] })
    comments: CommentResponseDto[];

    @ApiProperty({ description: '전체 댓글 수' })
    totalCount: number;

    @ApiProperty({ description: '다음 페이지 존재 여부' })
    hasNextPage: boolean;
}
