import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BreederBusinessLocationDto {
    @ApiProperty({ description: '시', example: '경상남도' })
    city: string;

    @ApiProperty({ description: '구/시', example: '창원시' })
    district: string;

    @ApiPropertyOptional({ description: '상세 주소', example: '의창구 ○○대로 12' })
    address?: string;
}

/**
 * GET /v2/profile/breeders/:breederId 응답 (브리더홈 — 공개)
 */
export class BreederPublicProfileResponseDto {
    @ApiProperty({ description: '브리더 ID', example: '507f1f77bcf86cd799439011' })
    breederId: string;

    @ApiProperty({ description: '닉네임', example: '도심속 도마뱀 사장님' })
    nickname: string;

    @ApiPropertyOptional({ description: '프로필 이미지 URL' })
    profileImageUrl?: string;

    @ApiProperty({ description: '한 줄 소개', example: '안녕하세요 감사해요' })
    bio: string;

    @ApiProperty({ description: '긴 소개글 (최대 1500자)' })
    longDescription: string;

    @ApiProperty({ description: 'BPM', example: 60 })
    bpm: number;

    @ApiProperty({ description: '팔로워(=즐겨찾기 입양자) 수', example: 1600 })
    followerCount: number;

    @ApiProperty({ description: '인증 레벨', enum: ['new', 'elite'], example: 'elite' })
    level: 'new' | 'elite';

    @ApiProperty({ description: '요금제', enum: ['basic', 'pro'], example: 'pro' })
    plan: 'basic' | 'pro';

    @ApiProperty({ description: '사업장 위치', type: BreederBusinessLocationDto })
    businessLocation: BreederBusinessLocationDto;

    @ApiProperty({
        description: '현재 로그인 입양자가 이 브리더를 즐겨찾기 했는지 (비로그인/브리더 호출 시 false)',
        example: true,
    })
    isFavorited: boolean;
}
