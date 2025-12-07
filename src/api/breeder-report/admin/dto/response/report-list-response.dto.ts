import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 신고 목록 응답 DTO
 *
 * GET /api/breeder-report-admin/reports
 */
export class ReportListResponseDto {
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
     * 신고 대상 브리더 ID
     * @example "507f1f77bcf86cd799439012"
     */
    @ApiProperty({
        description: '신고 대상 브리더 ID',
        example: '507f1f77bcf86cd799439012',
    })
    targetId: string;

    /**
     * 신고 대상 브리더 이름
     * @example "김브리더"
     */
    @ApiProperty({
        description: '신고 대상 브리더 이름',
        example: '김브리더',
    })
    targetName: string;

    /**
     * 신고 유형
     * @example "fraud"
     */
    @ApiProperty({
        description: '신고 유형',
        example: 'fraud',
    })
    type: string;

    /**
     * 신고 상세 설명
     * @example "사기 의심 브리더입니다."
     */
    @ApiProperty({
        description: '신고 상세 설명',
        example: '사기 의심 브리더입니다.',
    })
    description: string;

    /**
     * 신고 상태
     * @example "pending"
     */
    @ApiProperty({
        description: '신고 상태 (pending, resolved, dismissed)',
        example: 'pending',
    })
    status: string;

    /**
     * 신고 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '신고 일시',
        example: '2025-01-15T10:30:00.000Z',
    })
    reportedAt: Date;

    /**
     * 관리자 조치 메모
     * @example "확인 후 제재 처리"
     */
    @ApiProperty({
        description: '관리자 조치 메모',
        example: '확인 후 제재 처리',
        required: false,
    })
    adminNotes?: string;
}
