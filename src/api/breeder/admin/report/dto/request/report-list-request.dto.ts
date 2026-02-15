import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 브리더 신고 목록 조회 요청 DTO
 *
 * GET /api/breeder-report-admin/reports
 */
export class ReportListRequestDto {
    /**
     * 신고 상태 필터
     * @example "pending"
     */
    @ApiProperty({
        description: '신고 상태 (pending, resolved, dismissed)',
        example: 'pending',
        required: false,
    })
    @IsOptional()
    @IsString()
    status?: string;

    /**
     * 페이지 번호 (1부터 시작)
     * @example 1
     */
    @ApiProperty({
        description: '페이지 번호 (1부터 시작)',
        example: 1,
        default: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    pageNumber?: number;

    /**
     * 페이지당 아이템 수
     * @example 10
     */
    @ApiProperty({
        description: '페이지당 아이템 수',
        example: 10,
        default: 10,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    itemsPerPage?: number;
}
