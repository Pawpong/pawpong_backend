import { ApiProperty } from '@nestjs/swagger';

export class CommunityLikeResponseDto {
    @ApiProperty({ description: '게시글 ID' })
    postId: string;

    @ApiProperty({ description: '좋아요 성공 여부 (이미 좋아요한 경우 false)' })
    liked: boolean;
}

export class CommunityUnlikeResponseDto {
    @ApiProperty({ description: '게시글 ID' })
    postId: string;

    @ApiProperty({ description: '취소 성공 여부 (좋아요 안 한 경우 false)' })
    unliked: boolean;
}
