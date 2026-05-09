import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * GET /v2/profile/me/favorite-breeders 의 페이지네이션 카드.
 */
export class FavoriteBreederCardResponseDto {
    @ApiProperty({ description: '브리더 ID', example: '507f1f77bcf86cd799439011' })
    breederId: string;

    @ApiProperty({ description: '브리더 닉네임', example: '도심속 도마뱀 사장님' })
    nickname: string;

    @ApiPropertyOptional({ description: '프로필 이미지 URL' })
    profileImageUrl?: string;

    @ApiProperty({ description: '브리더 위치 (시/구)', example: '경상남도 창원시' })
    breederLocation: string;

    @ApiPropertyOptional({
        description: '가장 최근 활성 분양 펫의 status — 카드 뱃지 표기용. 없으면 undefined',
        enum: ['available', 'reserved', 'adopted'],
        example: 'available',
    })
    recentPetStatus?: 'available' | 'reserved' | 'adopted';

    @ApiProperty({ description: 'BPM', example: 60 })
    bpm: number;

    @ApiPropertyOptional({ description: '인증 레벨', enum: ['new', 'elite'], example: 'elite' })
    level?: 'new' | 'elite';

    @ApiProperty({ description: '즐겨찾기 추가 일시 (ISO 8601)', example: '2026-04-01T10:00:00.000Z' })
    addedAt: string;
}
