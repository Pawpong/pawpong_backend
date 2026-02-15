import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 신고 처리 응답 DTO
 *
 * PATCH /api/breeder-report-admin/reports/:reportId
 */
export class ReportActionResponseDto {
    /**
     * 신고 고유 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '신고 고유 ID',
        example: '507f1f77bcf86cd799439011',
    })
    reportId: string;

    /**
     * 브리더 고유 ID
     * @example "507f1f77bcf86cd799439012"
     */
    @ApiProperty({
        description: '브리더 고유 ID',
        example: '507f1f77bcf86cd799439012',
    })
    breederId: string;

    /**
     * 처리 액션
     * @example "resolve"
     */
    @ApiProperty({
        description: '처리 액션 (resolve, reject)',
        example: 'resolve',
    })
    action: string;

    /**
     * 처리 후 상태
     * @example "resolved"
     */
    @ApiProperty({
        description: '처리 후 상태 (resolved, dismissed)',
        example: 'resolved',
    })
    status: string;

    /**
     * 관리자 메모
     * @example "사기 행위 확인되어 제재 처리"
     */
    @ApiProperty({
        description: '관리자 메모',
        example: '사기 행위 확인되어 제재 처리',
        required: false,
    })
    adminNotes?: string;

    /**
     * 처리 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '처리 일시',
        example: '2025-01-15T10:30:00.000Z',
    })
    processedAt: Date;
}
