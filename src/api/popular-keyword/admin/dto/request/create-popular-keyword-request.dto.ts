import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePopularKeywordRequestDto {
    @ApiProperty({
        description: '검색어 텍스트',
        example: '비숑',
    })
    @IsString()
    @IsNotEmpty()
    keyword: string;

    @ApiProperty({
        description: '정렬 순서 (낮을수록 상단)',
        example: 0,
        required: false,
    })
    @IsInt()
    @IsOptional()
    rank?: number;

    @ApiProperty({
        description: '활성 여부',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
