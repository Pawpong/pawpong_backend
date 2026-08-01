import { ApiProperty } from '@nestjs/swagger';

import { AdoptionPetResponseDto } from './adoption-pet-response.dto';

/**
 * 모바일 저장 목록 — "입양목록" 탭(Figma 296:3286) 카드.
 * 일반 분양 펫 카드에 입양 확정 시각이 추가된다.
 */
export class AdoptedPetCardResponseDto extends AdoptionPetResponseDto {
    @ApiProperty({
        description: '입양 확정 시각 (ISO 8601, 입양 승인된 application.reviewedAt 또는 appliedAt)',
        example: '2025-12-08T00:00:00.000Z',
    })
    adoptedAt: string;
}
