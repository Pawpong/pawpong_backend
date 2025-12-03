import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 제재 응답 DTO
 *
 * POST /api/breeder-admin/suspend/:breederId 응답
 */
export class BreederSuspendResponseDto {
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
     * 제재 사유
     * @example "반복적인 규정 위반으로 인한 영구정지"
     */
    @ApiProperty({
        description: '제재 사유',
        example: '반복적인 규정 위반으로 인한 영구정지',
    })
    reason: string;

    /**
     * 제재 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '제재 일시 (ISO 8601 형식)',
        example: '2025-01-15T10:30:00.000Z',
    })
    suspendedAt: Date;

    /**
     * 알림 발송 여부
     * @example true
     */
    @ApiProperty({
        description: '브리더에게 알림 발송 여부',
        example: true,
    })
    notificationSent: boolean;
}
