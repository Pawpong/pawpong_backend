import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 시스템 헬스 조회 필터 요청 DTO
 */
export class SystemHealthFilterRequestDto {
    /**
     * 조회 기간 (시간 단위)
     * @example 24
     */
    @ApiProperty({
        description: '조회 기간 (시간 단위). 기본값 24시간, 최대 168시간(7일)',
        example: 24,
        minimum: 1,
        maximum: 168,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(168)
    periodHours?: number = 24;
}
