import { Injectable } from '@nestjs/common';

import { PlatformAdminMvpStatsSnapshot, PlatformAdminStatsSnapshot } from '../../application/ports/platform-admin-reader.port';
import type { PlatformAdminMvpStatsResult, PlatformAdminStatsResult } from '../../application/types/platform-admin-result.type';

@Injectable()
export class PlatformAdminResultMapperService {
    toStatsResult(snapshot: PlatformAdminStatsSnapshot): PlatformAdminStatsResult {
        return {
            userStatistics: snapshot.userStatistics,
            adoptionStatistics: snapshot.adoptionStatistics,
            popularBreeds: snapshot.popularBreeds,
            regionalStatistics: snapshot.regionalStatistics,
            breederPerformanceRanking: snapshot.breederPerformanceRanking,
            reportStatistics: snapshot.reportStatistics,
        };
    }

    toMvpStatsResult(snapshot: PlatformAdminMvpStatsSnapshot): PlatformAdminMvpStatsResult {
        return {
            activeUserStats: snapshot.activeUserStats,
            consultationStats: snapshot.consultationStats,
            filterUsageStats: snapshot.filterUsageStats,
            breederResubmissionStats: snapshot.breederResubmissionStats,
        };
    }
}
