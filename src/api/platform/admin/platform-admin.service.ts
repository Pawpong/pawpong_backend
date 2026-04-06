import { Injectable } from '@nestjs/common';

import { StatsFilterRequestDto } from './dto/request/stats-filter-request.dto';
import { AdminStatsResponseDto } from './dto/response/admin-stats-response.dto';
import { MvpStatsResponseDto } from './dto/response/mvp-stats-response.dto';
import { GetPlatformStatsUseCase } from './application/use-cases/get-platform-stats.use-case';
import { GetPlatformMvpStatsUseCase } from './application/use-cases/get-platform-mvp-stats.use-case';

/**
 * 플랫폼 Admin 서비스
 *
 * 플랫폼 전체 통계 관련 관리자 기능을 제공합니다:
 * - 플랫폼 통계 조회
 * - 사용자 통계
 * - 입양 신청 통계
 * - 인기 품종 통계
 * - 지역별 통계
 * - 브리더 성과 랭킹
 * - 신고 통계
 */
@Injectable()
export class PlatformAdminService {
    constructor(
        private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase,
        private readonly getPlatformMvpStatsUseCase: GetPlatformMvpStatsUseCase,
    ) {}

    /**
     * 플랫폼 통계 조회
     *
     * 전체 플랫폼의 통계 정보를 조회합니다:
     * - 사용자 통계 (입양자/브리더)
     * - 입양 신청 통계
     * - 인기 품종 통계
     * - 지역별 통계
     * - 브리더 성과 랭킹
     * - 신고 통계
     *
     * @param adminId 관리자 고유 ID
     * @param filter 통계 필터 (날짜 범위, 유형 등)
     * @returns 플랫폼 통계
     */
    async getStats(adminId: string, filter: StatsFilterRequestDto): Promise<AdminStatsResponseDto> {
        return this.getPlatformStatsUseCase.execute(adminId, filter);
    }

    /**
     * MVP 통계 조회
     *
     * MVP 단계에서 필요한 핵심 통계 정보를 조회합니다:
     * - 최근 7/14/28일간 활성 사용자 통계
     * - 최근 7/14/28일간 상담/입양 신청 통계
     * - 필터 사용 통계 (지역/품종)
     * - 브리더 서류 재제출 비율
     *
     * @param adminId 관리자 고유 ID
     * @returns MVP 통계
     */
    async getMvpStats(adminId: string): Promise<MvpStatsResponseDto> {
        return this.getPlatformMvpStatsUseCase.execute(adminId);
    }
}
