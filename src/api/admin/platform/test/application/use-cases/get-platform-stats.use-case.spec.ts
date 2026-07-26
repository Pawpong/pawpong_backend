import { DomainAuthorizationError } from '../../../../../../common/error/domain.error';
import { GetPlatformStatsUseCase } from '../../../application/use-cases/get-platform-stats.use-case';
import { PlatformAdminResultMapperService } from '../../../domain/services/platform-admin-result-mapper.service';
import { PlatformAdminQueryPolicyService } from '../../../domain/services/platform-admin-query-policy.service';
import { PlatformAdminReaderPort } from '../../../application/ports/platform-admin-reader.port';

describe('플랫폼 통계 조회 유스케이스', () => {
    it('권한이 있으면 플랫폼 통계를 반환한다', async () => {
        const reader: PlatformAdminReaderPort = {
            findAdminById: jest.fn().mockResolvedValue({
                id: 'admin-1',
                permissions: { canViewStatistics: true },
            }),
            getStats: jest.fn().mockResolvedValue({
                userStatistics: {
                    totalAdopterCount: 10,
                    newAdopterCount: 0,
                    activeAdopterCount: 10,
                    totalBreederCount: 3,
                    newBreederCount: 0,
                    approvedBreederCount: 2,
                    pendingBreederCount: 1,
                },
                adoptionStatistics: {
                    totalApplicationCount: 20,
                    newApplicationCount: 0,
                    completedAdoptionCount: 5,
                    pendingApplicationCount: 10,
                    rejectedApplicationCount: 5,
                },
                popularBreeds: [
                    {
                        breedName: '포메라니안',
                        petType: 'dog',
                        applicationCount: 7,
                        completedAdoptionCount: 0,
                        averagePrice: 1000000,
                    },
                ],
                regionalStatistics: [
                    {
                        cityName: '서울특별시',
                        districtName: '강남구',
                        breederCount: 3,
                        applicationCount: 10,
                        completedAdoptionCount: 4,
                    },
                ],
                breederPerformanceRanking: [
                    {
                        breederId: 'breeder-1',
                        breederName: '브리더A',
                        cityName: '서울특별시',
                        applicationCount: 10,
                        completedAdoptionCount: 4,
                        averageRating: 4.8,
                        totalReviewCount: 12,
                        profileViewCount: 100,
                    },
                ],
                reportStatistics: {
                    totalReportCount: 2,
                    newReportCount: 0,
                    resolvedReportCount: 1,
                    pendingReportCount: 1,
                    dismissedReportCount: 0,
                },
            }),
            getMvpStats: jest.fn(),
        };
        const useCase = new GetPlatformStatsUseCase(
            reader,
            new PlatformAdminQueryPolicyService(),
            new PlatformAdminResultMapperService(),
        );

        await expect(
            useCase.execute('admin-1', {
                statsType: 'daily' as any,
                pageNumber: 1,
                itemsPerPage: 10,
            }),
        ).resolves.toMatchObject({
            userStatistics: { totalAdopterCount: 10, totalBreederCount: 3 },
            popularBreeds: [{ breedName: '포메라니안' }],
        });
    });

    it('권한이 없으면 예외를 던진다', async () => {
        const useCase = new GetPlatformStatsUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    id: 'admin-1',
                    permissions: { canViewStatistics: false },
                }),
                getStats: jest.fn(),
                getMvpStats: jest.fn(),
            },
            new PlatformAdminQueryPolicyService(),
            new PlatformAdminResultMapperService(),
        );

        await expect(
            useCase.execute('admin-1', {
                statsType: 'daily' as any,
                pageNumber: 1,
                itemsPerPage: 10,
            }),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});
