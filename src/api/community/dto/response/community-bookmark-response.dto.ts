import { ApiProperty } from '@nestjs/swagger';

export class CommunityBookmarkResponseDto {
    @ApiProperty({ description: '저장된 게시글 ID', example: '507f1f77bcf86cd799439011' })
    postId: string;

    @ApiProperty({ description: '저장 완료 여부 (false: 이미 저장됨 — 멱등)', example: true })
    saved: boolean;
}

export class CommunityUnsaveResponseDto {
    @ApiProperty({ description: '저장 취소된 게시글 ID', example: '507f1f77bcf86cd799439011' })
    postId: string;

    @ApiProperty({ description: '취소 완료 여부 (false: 저장 안 된 상태였음 — 멱등)', example: true })
    unsaved: boolean;
}
