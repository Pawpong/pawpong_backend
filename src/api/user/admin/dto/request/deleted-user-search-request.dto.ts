import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';

/**
 * 탈퇴 사용자 검색 요청 DTO
 */
export class DeletedUserSearchRequestDto {
    /**
     * 페이지 번호 (1부터 시작)
     * @example 1
     */
    @ApiProperty({
        description: '페이지 번호',
        example: 1,
        required: false,
        minimum: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    /**
     * 페이지당 항목 수
     * @example 20
     */
    @ApiProperty({
        description: '페이지당 항목 수',
        example: 20,
        required: false,
        minimum: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 20;

    /**
     * 사용자 역할 필터
     * @example "adopter"
     */
    @ApiProperty({
        description: '사용자 역할 (전체, 입양자, 브리더)',
        enum: ['all', 'adopter', 'breeder'],
        required: false,
        example: 'all',
    })
    @IsEnum(['all', 'adopter', 'breeder'])
    @IsOptional()
    role?: 'all' | 'adopter' | 'breeder' = 'all';

    /**
     * 탈퇴 사유 필터
     * @example "already_adopted"
     */
    @ApiProperty({
        description: '탈퇴 사유',
        required: false,
        example: 'already_adopted',
    })
    @IsString()
    @IsOptional()
    deleteReason?: string;
}
