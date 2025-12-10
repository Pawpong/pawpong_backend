import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 알림 목록 조회 요청 DTO
 */
export class NotificationListRequestDto {
    /**
     * 읽음 여부 필터 (true: 읽은 것만, false: 안 읽은 것만, undefined: 전체)
     * @example false
     */
    @ApiPropertyOptional({
        description: '읽음 여부 필터',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isRead?: boolean;

    /**
     * 페이지 번호
     * @example 1
     */
    @ApiPropertyOptional({
        description: '페이지 번호',
        example: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    pageNumber?: number = 1;

    /**
     * 페이지당 항목 수
     * @example 20
     */
    @ApiPropertyOptional({
        description: '페이지당 항목 수',
        example: 20,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    itemsPerPage?: number = 20;
}
