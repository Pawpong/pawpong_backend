import { ForbiddenException } from '@nestjs/common';

import { GetPlatformMvpStatsUseCase } from '../../../application/use-cases/get-platform-mvp-stats.use-case';
import { PlatformAdminPresentationService } from '../../../domain/services/platform-admin-presentation.service';
import { PlatformAdminQueryPolicyService } from '../../../domain/services/platform-admin-query-policy.service';
import { PlatformAdminReaderPort } from '../../../application/ports/platform-admin-reader.port';

describe('플랫폼 초기 버전 통계 조회 유스케이스', () => {
    it('권한이 있으면 초기 버전 통계를 반환한다', async () => {
        const reader: PlatformAdminReaderPort = {
            findAdminById: jest.fn().mockResolvedValue({
                id: 'admin-1',
                permissions: { canViewStatistics: true },
            }),
            getStats: jest.fn(),
            getMvpStats: jest.fn().mockResolvedValue({
                activeUserStats: {
                    adopters7Days: 10,
                    adopters14Days: 20,
                    adopters28Days: 30,
                    breeders7Days: 3,
                    breeders14Days: 5,
                    breeders28Days: 7,
                },
                consultationStats: {
                    consultations7Days: 8,
                    consultations14Days: 15,
                    consultations28Days: 22,
                    adoptions7Days: 2,
                    adoptions14Days: 4,
                    adoptions28Days: 6,
                },
                filterUsageStats: {
                    topLocations: [{ filterType: 'location', filterValue: '서울특별시', usageCount: 9 }],
                    topBreeds: [{ filterType: 'breed', filterValue: '포메라니안', usageCount: 7 }],
                    emptyResultFilters: [],
                },
                breederResubmissionStats: {
                    totalRejections: 5,
                    resubmissions: 3,
                    resubmissionRate: 60,
                    resubmissionApprovals: 2,
                    resubmissionApprovalRate: 67,
                },
            }),
        };
        const useCase = new GetPlatformMvpStatsUseCase(
            reader,
            new PlatformAdminQueryPolicyService(),
            new PlatformAdminPresentationService(),
        );

        await expect(useCase.execute('admin-1')).resolves.toMatchObject({
            activeUserStats: { adopters7Days: 10, breeders28Days: 7 },
            breederResubmissionStats: { totalRejections: 5, resubmissionRate: 60 },
        });
    });

    it('권한이 없으면 예외를 던진다', async () => {
        const useCase = new GetPlatformMvpStatsUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    id: 'admin-1',
                    permissions: { canViewStatistics: false },
                }),
                getStats: jest.fn(),
                getMvpStats: jest.fn(),
            },
            new PlatformAdminQueryPolicyService(),
            new PlatformAdminPresentationService(),
        );

        await expect(useCase.execute('admin-1')).rejects.toBeInstanceOf(ForbiddenException);
    });
});
