import { Injectable } from '@nestjs/common';

import { AdminStatsResponseDto } from '../../dto/response/admin-stats-response.dto';
import { MvpStatsResponseDto } from '../../dto/response/mvp-stats-response.dto';
import { PlatformAdminMvpStatsSnapshot, PlatformAdminStatsSnapshot } from '../../application/ports/platform-admin-reader.port';

@Injectable()
export class PlatformAdminPresentationService {
    toAdminStatsResponse(snapshot: PlatformAdminStatsSnapshot): AdminStatsResponseDto {
        return {
            userStatistics: snapshot.userStatistics,
            adoptionStatistics: snapshot.adoptionStatistics,
            popularBreeds: snapshot.popularBreeds,
            regionalStatistics: snapshot.regionalStatistics,
            breederPerformanceRanking: snapshot.breederPerformanceRanking,
            reportStatistics: snapshot.reportStatistics,
        };
    }

    toMvpStatsResponse(snapshot: PlatformAdminMvpStatsSnapshot): MvpStatsResponseDto {
        return {
            activeUserStats: snapshot.activeUserStats,
            consultationStats: snapshot.consultationStats,
            filterUsageStats: snapshot.filterUsageStats,
            breederResubmissionStats: snapshot.breederResubmissionStats,
        };
    }
}
