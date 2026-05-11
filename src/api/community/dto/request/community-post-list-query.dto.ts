import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CommunityPostListQueryDto {
    @ApiPropertyOptional({ description: '동물 종류 필터', enum: ['dog', 'cat', 'reptile'] })
    @IsOptional()
    @IsEnum(['dog', 'cat', 'reptile'])
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({ description: '자유 카테고리 텍스트 필터 (정확 일치)', example: '레오파드' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    category?: string;

    @ApiPropertyOptional({ description: '정렬', enum: ['latest', 'popular'], example: 'latest' })
    @IsOptional()
    @IsEnum(['latest', 'popular'])
    sort?: 'latest' | 'popular' = 'latest';

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
