import { PlatformAdminResultMapperService } from '../../../domain/services/platform-admin-result-mapper.service';

describe('PlatformAdminResultMapperService', () => {
    const service = new PlatformAdminResultMapperService();

    it('Stats snapshot을 result로 매핑한다', () => {
        const snapshot = {
            userStatistics: { totalUsers: 100 },
            adoptionStatistics: { totalAdoptions: 50 },
            popularBreeds: [],
            regionalStatistics: [],
            breederPerformanceRanking: [],
            reportStatistics: { totalReports: 5 },
        };
        expect(service.toStatsResult(snapshot as any)).toEqual(snapshot);
    });

    it('MvpStats snapshot을 result로 매핑한다', () => {
        const snapshot = {
            activeUserStats: { dau: 100 },
            consultationStats: { totalConsultations: 10 },
            filterUsageStats: {},
            breederResubmissionStats: {},
        };
        expect(service.toMvpStatsResult(snapshot as any)).toEqual(snapshot);
    });
});
