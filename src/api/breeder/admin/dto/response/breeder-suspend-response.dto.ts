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
     * 제재 사유 (정지 해제 시에는 undefined)
     * @example "반복적인 규정 위반으로 인한 영구정지"
     */
    @ApiProperty({
        description: '제재 사유 (정지 시), 정지 해제 시에는 null',
        example: '반복적인 규정 위반으로 인한 영구정지',
        required: false,
    })
    reason?: string;

    /**
     * 제재 일시 (정지 해제 시에는 undefined)
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '제재 일시 (ISO 8601 형식), 정지 해제 시에는 null',
        example: '2025-01-15T10:30:00.000Z',
        required: false,
    })
    suspendedAt?: Date;

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
