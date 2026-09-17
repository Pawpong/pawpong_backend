import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { VerificationStatus } from '../../../../../../common/enum/user.enum';

/**
 * 브리더 검색 요청 DTO
 */
export class BreederSearchRequestDto {
    @ApiProperty({
        description: '계정 구분. normal은 테스트 표시가 없는 기존 계정도 포함',
        enum: ['all', 'normal', 'test'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['all', 'normal', 'test'])
    accountType?: 'all' | 'normal' | 'test';

    /**
     * 인증 상태 필터
     * @example "pending"
     */
    @ApiProperty({
        description: '인증 상태 필터',
        example: 'pending',
        enum: VerificationStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(VerificationStatus)
    verificationStatus?: VerificationStatus;

    /**
     * 도시 이름 필터
     * @example "서울"
     */
    @ApiProperty({
        description: '도시 이름 필터',
        example: '서울',
        required: false,
    })
    @IsOptional()
    @IsString()
    cityName?: string;

    /**
     * 검색 키워드 (이름, 이메일)
     * @example "김철수"
     */
    @ApiProperty({
        description: '검색 키워드 (이름, 이메일)',
        example: '김철수',
        required: false,
    })
    @IsOptional()
    @IsString()
    searchKeyword?: string;

    /**
     * 페이지 번호
     * @example 1
     */
    @ApiProperty({
        description: '페이지 번호',
        example: 1,
        required: false,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageNumber?: number = 1;

    /**
     * 페이지당 항목 수
     * @example 10
     */
    @ApiProperty({
        description: '페이지당 항목 수',
        example: 10,
        required: false,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    itemsPerPage?: number = 10;
}
