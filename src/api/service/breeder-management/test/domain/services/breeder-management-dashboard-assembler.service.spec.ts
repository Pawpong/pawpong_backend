import { BreederManagementDashboardAssemblerService } from '../../../domain/services/breeder-management-dashboard-assembler.service';

describe('BreederManagementDashboardAssemblerService', () => {
    const service = new BreederManagementDashboardAssemblerService();

    it('기본 대시보드 결과를 구성한다', () => {
        const result = service.toResponse(
            {
                verification: { status: 'approved', plan: 'pro' },
                stats: {
                    totalApplications: 10,
                    completedAdoptions: 3,
                    averageRating: 4.5,
                    totalReviews: 8,
                    profileViews: 100,
                },
            } as any,
            2,
            [],
            5,
        );
        expect(result.profileInfo.verificationInfo.verificationStatus).toBe('approved');
        expect(result.statisticsInfo.totalApplicationCount).toBe(10);
        expect(result.statisticsInfo.pendingApplicationCount).toBe(2);
        expect(result.availablePetCount).toBe(5);
    });

    it('verification이 없으면 기본값 사용', () => {
        const result = service.toResponse({} as any, 0, [], 0);
        expect(result.profileInfo.verificationInfo.verificationStatus).toBe('pending');
        expect(result.profileInfo.verificationInfo.subscriptionPlan).toBe('basic');
    });

    it('recentApplications를 리스트로 매핑한다', () => {
        const result = service.toResponse(
            {} as any,
            0,
            [{ _id: 'a-1', adopterName: '이름', petName: '초코', status: 'pending', appliedAt: new Date() } as any],
            0,
        );
        expect(result.recentApplicationList).toHaveLength(1);
        expect(result.recentApplicationList[0].adopterName).toBe('이름');
    });

    it('필드가 없으면 Unknown 기본값', () => {
        const result = service.toResponse({} as any, 0, [{ _id: 'a-1', appliedAt: new Date() } as any], 0);
        expect(result.recentApplicationList[0].adopterName).toBe('Unknown');
        expect(result.recentApplicationList[0].petName).toBe('Unknown');
    });
});
