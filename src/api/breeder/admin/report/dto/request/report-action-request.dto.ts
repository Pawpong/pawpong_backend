import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

/**
 * 브리더 신고 처리 요청 DTO
 *
 * PATCH /api/breeder-report-admin/reports/:reportId
 */
export class ReportActionRequestDto {
    /**
     * 처리 액션 (resolve: 승인/제재, reject: 반려)
     * @example "resolve"
     */
    @ApiProperty({
        description: '처리 액션 (resolve: 승인/제재, reject: 반려)',
        example: 'resolve',
        enum: ['resolve', 'reject'],
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(['resolve', 'reject'])
    action: 'resolve' | 'reject';

    /**
     * 관리자 메모
     * @example "사기 행위 확인되어 제재 처리"
     */
    @ApiProperty({
        description: '관리자 메모 (선택)',
        example: '사기 행위 확인되어 제재 처리',
        required: false,
    })
    @IsOptional()
    @IsString()
    adminNotes?: string;
}
