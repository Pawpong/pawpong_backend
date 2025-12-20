import { ApiProperty } from '@nestjs/swagger';

/**
 * 탈퇴 사용자 통계 응답 DTO
 */
export class DeletedUserStatsResponseDto {
    /**
     * 전체 탈퇴 사용자 수
     * @example 150
     */
    @ApiProperty({
        description: '전체 탈퇴 사용자 수',
        example: 150,
    })
    totalDeletedUsers: number;

    /**
     * 탈퇴한 입양자 수
     * @example 100
     */
    @ApiProperty({
        description: '탈퇴한 입양자 수',
        example: 100,
    })
    totalDeletedAdopters: number;

    /**
     * 탈퇴한 브리더 수
     * @example 50
     */
    @ApiProperty({
        description: '탈퇴한 브리더 수',
        example: 50,
    })
    totalDeletedBreeders: number;

    /**
     * 입양자 탈퇴 사유별 통계
     * @example [{ reason: "already_adopted", reasonLabel: "이미 입양을 마쳤어요", count: 30, percentage: 30 }]
     */
    @ApiProperty({
        description: '입양자 탈퇴 사유별 통계',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                reason: { type: 'string', example: 'already_adopted' },
                reasonLabel: { type: 'string', example: '이미 입양을 마쳤어요' },
                count: { type: 'number', example: 30 },
                percentage: { type: 'number', example: 30 },
            },
        },
    })
    adopterReasonStats: Array<{
        reason: string;
        reasonLabel: string;
        count: number;
        percentage: number;
    }>;

    /**
     * 브리더 탈퇴 사유별 통계
     * @example [{ reason: "no_inquiry", reasonLabel: "입양 문의가 잘 오지 않았어요", count: 15, percentage: 30 }]
     */
    @ApiProperty({
        description: '브리더 탈퇴 사유별 통계',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                reason: { type: 'string', example: 'no_inquiry' },
                reasonLabel: { type: 'string', example: '입양 문의가 잘 오지 않았어요' },
                count: { type: 'number', example: 15 },
                percentage: { type: 'number', example: 30 },
            },
        },
    })
    breederReasonStats: Array<{
        reason: string;
        reasonLabel: string;
        count: number;
        percentage: number;
    }>;

    /**
     * 기타 사유 상세 목록 (최대 50개)
     * @example [{ userType: "adopter", reason: "입양경로: pawpong", deletedAt: "2025-01-15T10:00:00Z" }]
     */
    @ApiProperty({
        description: '기타 사유 상세 목록',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                userType: { type: 'string', example: 'adopter' },
                reason: { type: 'string', example: '입양경로: pawpong' },
                deletedAt: { type: 'string', example: '2025-01-15T10:00:00Z' },
            },
        },
    })
    otherReasonDetails: Array<{
        userType: 'adopter' | 'breeder';
        reason: string;
        deletedAt: string;
    }>;

    /**
     * 최근 7일간 탈퇴자 수
     * @example 15
     */
    @ApiProperty({
        description: '최근 7일간 탈퇴자 수',
        example: 15,
    })
    last7DaysCount: number;

    /**
     * 최근 30일간 탈퇴자 수
     * @example 42
     */
    @ApiProperty({
        description: '최근 30일간 탈퇴자 수',
        example: 42,
    })
    last30DaysCount: number;
}
