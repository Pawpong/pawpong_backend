import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * GET /v2/profile/users/{userId}/followers|followings 의 페이지네이션 카드.
 * isFollowing && isFollowedBy 가 모두 true 면 "맞팔로잉" 상태다.
 */
export class FollowUserCardResponseDto {
    @ApiProperty({ description: '사용자 ID', example: '507f1f77bcf86cd799439011' })
    userId: string;

    @ApiProperty({ description: '닉네임', example: '도마뱀집사님' })
    nickname: string;

    @ApiPropertyOptional({ description: '프로필 이미지 URL' })
    profileImageUrl?: string;

    @ApiProperty({ description: '한 줄 소개', example: '파충류 3년차 집사입니다' })
    bio: string;

    @ApiProperty({ description: '조회자가 이 사용자를 팔로우 중인지 (비로그인 시 false)', example: true })
    isFollowing: boolean;

    @ApiProperty({
        description: '이 사용자가 조회자를 팔로우 중인지 (isFollowing 과 모두 true 면 맞팔로잉)',
        example: true,
    })
    isFollowedBy: boolean;

    @ApiProperty({ description: '팔로우 일시 (ISO 8601)', example: '2026-04-01T10:00:00.000Z' })
    followedAt: string;
}

/** 내 팔로워 삭제 응답 */
export class RemoveFollowerResponseDto {
    @ApiProperty({ description: '삭제한 팔로워의 사용자 ID', example: '507f1f77bcf86cd799439011' })
    followerId: string;

    @ApiProperty({ description: '삭제 완료 여부 (false: 팔로워가 아니었음 — 멱등)', example: true })
    removed: boolean;
}
