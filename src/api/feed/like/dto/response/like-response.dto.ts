import { ApiProperty } from '@nestjs/swagger';

/**
 * 좋아요 토글 응답 DTO
 */
export class LikeToggleResponseDto {
    @ApiProperty({ description: '좋아요 상태' })
    isLiked: boolean;

    @ApiProperty({ description: '총 좋아요 수' })
    likeCount: number;
}

/**
 * 좋아요 상태 응답 DTO
 */
export class LikeStatusResponseDto {
    @ApiProperty({ description: '좋아요 여부' })
    isLiked: boolean;

    @ApiProperty({ description: '총 좋아요 수' })
    likeCount: number;
}
