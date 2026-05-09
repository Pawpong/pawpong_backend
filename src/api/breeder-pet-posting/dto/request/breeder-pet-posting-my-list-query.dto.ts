import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class BreederPetPostingMyListQueryDto {
    @ApiPropertyOptional({
        description: '분양 상태 필터 (미지정 시 전체)',
        enum: ['available', 'reserved', 'adopted'],
    })
    @IsOptional()
    @IsEnum(['available', 'reserved', 'adopted'])
    status?: 'available' | 'reserved' | 'adopted';

    @ApiPropertyOptional({ description: '페이지 (1-based)', example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: '페이지 크기', example: 15, minimum: 1, maximum: 60 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(60)
    pageSize?: number = 15;
}
