import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * GET /v2/profile/users/:userId 응답 (다른 입양자 프로필 = 유저홈)
 *
 * 게시글 목록은 별도 endpoint(추후 community 도메인) 에서 페이지네이션으로 제공된다.
 */
export class AdopterPublicProfileResponseDto {
    @ApiProperty({ description: '입양자 ID', example: '507f1f77bcf86cd799439011' })
    userId: string;

    @ApiProperty({ description: '닉네임', example: '파이리귀여워' })
    nickname: string;

    @ApiPropertyOptional({ description: '프로필 이미지 URL' })
    profileImageUrl?: string;

    @ApiProperty({ description: '한 줄 소개', example: '안녕하세요 감사해요' })
    bio: string;

    @ApiProperty({ description: 'BPM', example: 60 })
    bpm: number;

    @ApiProperty({ description: '팔로워 수', example: 100 })
    followerCount: number;

    @ApiProperty({
        description: '현재 로그인 사용자가 이 입양자를 팔로우 중인지 (입양자→입양자 follow 시스템 미구현 — 항상 false)',
        example: false,
    })
    isFollowing: boolean;
}
