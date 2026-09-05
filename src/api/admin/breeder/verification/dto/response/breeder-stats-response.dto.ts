import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 통계 응답 DTO
 *
 * 전체 승인된 브리더의 통계 정보를 반환합니다.
 */
export class BreederStatsResponseDto {
    /**
     * 전체 승인된 브리더 수
     * @example 43
     */
    @ApiProperty({
        description: '전체 승인된 브리더 수',
        example: 43,
    })
    totalApproved: number;
}
