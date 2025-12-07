import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 리마인드 알림 응답 DTO
 *
 * POST /api/breeder-admin/remind 응답
 */
export class BreederRemindResponseDto {
    /**
     * 총 대상 브리더 수
     * @example 10
     */
    @ApiProperty({
        description: '총 대상 브리더 수',
        example: 10,
    })
    totalCount: number;

    /**
     * 알림 발송 성공 수
     * @example 8
     */
    @ApiProperty({
        description: '알림 발송 성공 수',
        example: 8,
    })
    successCount: number;

    /**
     * 알림 발송 실패 수
     * @example 2
     */
    @ApiProperty({
        description: '알림 발송 실패 수',
        example: 2,
    })
    failCount: number;

    /**
     * 발송 성공한 브리더 ID 목록
     * @example ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
     */
    @ApiProperty({
        description: '발송 성공한 브리더 ID 목록',
        type: [String],
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    })
    successIds: string[];

    /**
     * 발송 실패한 브리더 ID 목록
     * @example ["507f1f77bcf86cd799439013"]
     */
    @ApiProperty({
        description: '발송 실패한 브리더 ID 목록',
        type: [String],
        example: ['507f1f77bcf86cd799439013'],
    })
    failIds: string[];

    /**
     * 발송 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '발송 일시 (ISO 8601 형식)',
        example: '2025-01-15T10:30:00.000Z',
    })
    sentAt: Date;
}
