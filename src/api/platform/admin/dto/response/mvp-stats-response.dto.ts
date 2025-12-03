import { ApiProperty } from '@nestjs/swagger';

/**
 * 기간별 활성 사용자 통계 DTO
 */
export class ActiveUserStatsDto {
    /**
     * 최근 7일간 접속한 일반회원 수
     * @example 150
     */
    @ApiProperty({
        description: '최근 7일간 접속한 일반회원 수',
        example: 150,
    })
    adopters7Days: number;

    /**
     * 최근 14일간 접속한 일반회원 수
     * @example 250
     */
    @ApiProperty({
        description: '최근 14일간 접속한 일반회원 수',
        example: 250,
    })
    adopters14Days: number;

    /**
     * 최근 28일간 접속한 일반회원 수
     * @example 420
     */
    @ApiProperty({
        description: '최근 28일간 접속한 일반회원 수',
        example: 420,
    })
    adopters28Days: number;

    /**
     * 최근 7일간 접속한 브리더 수
     * @example 45
     */
    @ApiProperty({
        description: '최근 7일간 접속한 브리더 수',
        example: 45,
    })
    breeders7Days: number;

    /**
     * 최근 14일간 접속한 브리더 수
     * @example 78
     */
    @ApiProperty({
        description: '최근 14일간 접속한 브리더 수',
        example: 78,
    })
    breeders14Days: number;

    /**
     * 최근 28일간 접속한 브리더 수
     * @example 120
     */
    @ApiProperty({
        description: '최근 28일간 접속한 브리더 수',
        example: 120,
    })
    breeders28Days: number;
}

/**
 * 기간별 상담 신청 통계 DTO
 */
export class ConsultationStatsDto {
    /**
     * 최근 7일간 상담 신청 수
     * @example 45
     */
    @ApiProperty({
        description: '최근 7일간 상담 신청 수',
        example: 45,
    })
    consultations7Days: number;

    /**
     * 최근 14일간 상담 신청 수
     * @example 89
     */
    @ApiProperty({
        description: '최근 14일간 상담 신청 수',
        example: 89,
    })
    consultations14Days: number;

    /**
     * 최근 28일간 상담 신청 수
     * @example 175
     */
    @ApiProperty({
        description: '최근 28일간 상담 신청 수',
        example: 175,
    })
    consultations28Days: number;

    /**
     * 최근 7일간 입양 신청 수
     * @example 32
     */
    @ApiProperty({
        description: '최근 7일간 입양 신청 수',
        example: 32,
    })
    adoptions7Days: number;

    /**
     * 최근 14일간 입양 신청 수
     * @example 65
     */
    @ApiProperty({
        description: '최근 14일간 입양 신청 수',
        example: 65,
    })
    adoptions14Days: number;

    /**
     * 최근 28일간 입양 신청 수
     * @example 128
     */
    @ApiProperty({
        description: '최근 28일간 입양 신청 수',
        example: 128,
    })
    adoptions28Days: number;
}

/**
 * 필터 사용 통계 항목 DTO
 */
export class FilterUsageItemDto {
    /**
     * 필터 타입
     * @example "location"
     */
    @ApiProperty({
        description: '필터 타입',
        example: 'location',
    })
    filterType: string;

    /**
     * 필터 값
     * @example "서울"
     */
    @ApiProperty({
        description: '필터 값',
        example: '서울',
    })
    filterValue: string;

    /**
     * 사용 횟수
     * @example 450
     */
    @ApiProperty({
        description: '사용 횟수',
        example: 450,
    })
    usageCount: number;
}

/**
 * 필터 사용 통계 DTO
 */
export class FilterUsageStatsDto {
    /**
     * 가장 많이 사용된 지역 필터 (상위 10개)
     */
    @ApiProperty({
        description: '가장 많이 사용된 지역 필터',
        type: [FilterUsageItemDto],
    })
    topLocations: FilterUsageItemDto[];

    /**
     * 가장 많이 사용된 품종 필터 (상위 10개)
     */
    @ApiProperty({
        description: '가장 많이 사용된 품종 필터',
        type: [FilterUsageItemDto],
    })
    topBreeds: FilterUsageItemDto[];

    /**
     * 결과가 없었던 검색 조건 (상위 10개)
     */
    @ApiProperty({
        description: '결과가 없었던 검색 조건',
        type: [FilterUsageItemDto],
    })
    emptyResultFilters: FilterUsageItemDto[];
}

/**
 * 브리더 서류 재제출 통계 DTO
 */
export class BreederResubmissionStatsDto {
    /**
     * 총 서류 반려 건수
     * @example 85
     */
    @ApiProperty({
        description: '총 서류 반려 건수',
        example: 85,
    })
    totalRejections: number;

    /**
     * 재제출 건수
     * @example 68
     */
    @ApiProperty({
        description: '재제출 건수',
        example: 68,
    })
    resubmissions: number;

    /**
     * 재제출 비율 (%)
     * @example 80
     */
    @ApiProperty({
        description: '재제출 비율 (%)',
        example: 80,
    })
    resubmissionRate: number;

    /**
     * 재제출 후 승인 건수
     * @example 55
     */
    @ApiProperty({
        description: '재제출 후 승인 건수',
        example: 55,
    })
    resubmissionApprovals: number;

    /**
     * 재제출 후 승인 비율 (%)
     * @example 81
     */
    @ApiProperty({
        description: '재제출 후 승인 비율 (%)',
        example: 81,
    })
    resubmissionApprovalRate: number;
}

/**
 * MVP 통계 종합 응답 DTO
 * MVP 단계에서 필요한 핵심 통계 정보를 제공합니다.
 */
export class MvpStatsResponseDto {
    /**
     * 기간별 활성 사용자 통계
     */
    @ApiProperty({
        description: '기간별 활성 사용자 통계',
        type: ActiveUserStatsDto,
    })
    activeUserStats: ActiveUserStatsDto;

    /**
     * 기간별 상담/입양 신청 통계
     */
    @ApiProperty({
        description: '기간별 상담/입양 신청 통계',
        type: ConsultationStatsDto,
    })
    consultationStats: ConsultationStatsDto;

    /**
     * 필터 사용 통계
     */
    @ApiProperty({
        description: '필터 사용 통계',
        type: FilterUsageStatsDto,
    })
    filterUsageStats: FilterUsageStatsDto;

    /**
     * 브리더 서류 재제출 통계
     */
    @ApiProperty({
        description: '브리더 서류 재제출 통계',
        type: BreederResubmissionStatsDto,
    })
    breederResubmissionStats: BreederResubmissionStatsDto;
}
