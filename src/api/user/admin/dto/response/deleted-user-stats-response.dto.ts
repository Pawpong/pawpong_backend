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
     * 탈퇴 사유별 통계
     * @example [{ reason: "already_adopted", count: 45, percentage: 30 }]
     */
    @ApiProperty({
        description: '탈퇴 사유별 통계',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                reason: { type: 'string', example: 'already_adopted' },
                count: { type: 'number', example: 45 },
                percentage: { type: 'number', example: 30 },
            },
        },
    })
    reasonStats: Array<{
        reason: string;
        count: number;
        percentage: number;
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
