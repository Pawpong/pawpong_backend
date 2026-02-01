import { ApiProperty } from '@nestjs/swagger';

/**
 * 후기 답글 응답 DTO
 */
export class ReviewReplyResponseDto {
    /**
     * 후기 ID
     */
    @ApiProperty({
        description: '후기 ID',
        example: '507f1f77bcf86cd799439011',
    })
    reviewId: string;

    /**
     * 답글 내용
     */
    @ApiProperty({
        description: '답글 내용',
        example: '소중한 후기 감사합니다. 행복한 반려생활 되시길 바랍니다!',
    })
    replyContent: string;

    /**
     * 답글 작성 일시
     */
    @ApiProperty({
        description: '답글 작성 일시',
        example: '2025-01-26T10:30:00.000Z',
    })
    replyWrittenAt: string;

    /**
     * 답글 수정 일시 (수정된 경우에만)
     */
    @ApiProperty({
        description: '답글 수정 일시',
        example: '2025-01-26T11:00:00.000Z',
        required: false,
    })
    replyUpdatedAt?: string;
}

/**
 * 후기 답글 삭제 응답 DTO
 */
export class ReviewReplyDeleteResponseDto {
    /**
     * 후기 ID
     */
    @ApiProperty({
        description: '후기 ID',
        example: '507f1f77bcf86cd799439011',
    })
    reviewId: string;

    /**
     * 삭제 완료 메시지
     */
    @ApiProperty({
        description: '삭제 완료 메시지',
        example: '답글이 삭제되었습니다.',
    })
    message: string;
}
