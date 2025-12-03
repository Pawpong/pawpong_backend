import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 레벨 변경 응답 DTO
 *
 * PATCH /api/breeder-admin/level/:breederId 응답
 */
export class BreederLevelChangeResponseDto {
    /**
     * 브리더 고유 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '브리더 고유 ID',
        example: '507f1f77bcf86cd799439011',
    })
    breederId: string;

    /**
     * 변경 전 레벨
     * @example "new"
     */
    @ApiProperty({
        description: '변경 전 레벨',
        example: 'new',
    })
    previousLevel: string;

    /**
     * 변경 후 레벨
     * @example "elite"
     */
    @ApiProperty({
        description: '변경 후 레벨',
        example: 'elite',
    })
    currentLevel: string;

    /**
     * 변경 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '변경 일시 (ISO 8601 형식)',
        example: '2025-01-15T10:30:00.000Z',
    })
    changedAt: Date;
}
