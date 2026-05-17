import { ApiProperty } from '@nestjs/swagger';

export class FollowResponseDto {
    @ApiProperty({ description: '팔로우 대상 사용자 ID', example: '507f1f77bcf86cd799439011' })
    followeeId: string;

    @ApiProperty({ description: '팔로우 완료 여부 (false: 이미 팔로우 중 — 멱등)', example: true })
    followed: boolean;
}

export class UnfollowResponseDto {
    @ApiProperty({ description: '팔로우 취소 대상 사용자 ID', example: '507f1f77bcf86cd799439011' })
    followeeId: string;

    @ApiProperty({ description: '팔로우 취소 완료 여부 (false: 팔로우 중이 아니었음 — 멱등)', example: true })
    unfollowed: boolean;
}
