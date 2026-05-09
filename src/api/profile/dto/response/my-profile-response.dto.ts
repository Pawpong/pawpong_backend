import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BusinessLocationDto {
    @ApiProperty({ description: '시', example: '경상남도' })
    city: string;

    @ApiProperty({ description: '구/시', example: '창원시' })
    district: string;

    @ApiPropertyOptional({ description: '상세 주소', example: '의창구 ○○대로 12' })
    address?: string;
}

/**
 * GET /v2/profile/me 응답 — 입양자 또는 브리더 둘 다 한 DTO 로 통합 (role 으로 분기).
 * 브리더 한정 필드는 role === 'breeder' 일 때만 채워진다.
 */
export class MyProfileResponseDto {
    @ApiProperty({ description: '사용자 역할', enum: ['adopter', 'breeder'], example: 'adopter' })
    role: 'adopter' | 'breeder';

    @ApiProperty({ description: '사용자 ID', example: '507f1f77bcf86cd799439011' })
    userId: string;

    @ApiProperty({ description: '닉네임', example: '파이리귀여워' })
    nickname: string;

    @ApiPropertyOptional({ description: '프로필 이미지 URL', example: 'https://cdn.../signed?...' })
    profileImageUrl?: string;

    @ApiProperty({ description: '한 줄 소개', example: '안녕하세요 감사해요' })
    bio: string;

    @ApiProperty({ description: 'BPM (활동 점수)', example: 60 })
    bpm: number;

    @ApiProperty({ description: '팔로워 수', example: 100 })
    followerCount: number;

    // === Adopter only ===
    @ApiPropertyOptional({ description: '(입양자) 즐겨찾는 브리더 수', example: 3 })
    favoriteBreederCount?: number;

    // === Breeder only ===
    @ApiPropertyOptional({ description: '(브리더) 인증 레벨', enum: ['new', 'elite'], example: 'elite' })
    level?: 'new' | 'elite';

    @ApiPropertyOptional({ description: '(브리더) 요금제', enum: ['basic', 'pro'], example: 'pro' })
    plan?: 'basic' | 'pro';

    @ApiPropertyOptional({ description: '(브리더) 사업장 위치', type: BusinessLocationDto })
    businessLocation?: BusinessLocationDto;

    @ApiPropertyOptional({ description: '(브리더) 긴 소개글 (최대 1500자)' })
    longDescription?: string;
}
