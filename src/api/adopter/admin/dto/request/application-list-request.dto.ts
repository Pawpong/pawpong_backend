import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationStatus } from '../../../../../common/enum/user.enum';

/**
 * 입양 신청 리스트 조회 요청 DTO
 */
export class ApplicationListRequestDto {
    /**
     * 페이지 번호 (1부터 시작)
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
    page?: number = 1;

    /**
     * 페이지당 아이템 수
     * @example 10
     */
    @ApiProperty({
        description: '페이지당 아이템 수',
        example: 10,
        required: false,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    /**
     * 신청 상태 필터
     * @example "consultation_pending"
     */
    @ApiProperty({
        description: '신청 상태 필터',
        enum: ApplicationStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;

    /**
     * 브리더 이름 검색 (부분 일치)
     * @example "고등어"
     */
    @ApiProperty({
        description: '브리더 이름 검색',
        example: '고등어',
        required: false,
    })
    @IsOptional()
    @IsString()
    breederName?: string;

    /**
     * 시작 날짜 (YYYY-MM-DD)
     * @example "2026-01-01"
     */
    @ApiProperty({
        description: '시작 날짜',
        example: '2026-01-01',
        required: false,
    })
    @IsOptional()
    @IsString()
    startDate?: string;

    /**
     * 종료 날짜 (YYYY-MM-DD)
     * @example "2026-02-01"
     */
    @ApiProperty({
        description: '종료 날짜',
        example: '2026-02-01',
        required: false,
    })
    @IsOptional()
    @IsString()
    endDate?: string;
}
