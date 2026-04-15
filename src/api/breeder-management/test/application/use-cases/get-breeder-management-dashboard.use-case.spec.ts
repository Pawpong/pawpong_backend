import { DomainNotFoundError } from '../../../../../common/error/domain.error';

import { GetBreederManagementDashboardUseCase } from '../../../application/use-cases/get-breeder-management-dashboard.use-case';
import { BreederManagementDashboardAssemblerService } from '../../../domain/services/breeder-management-dashboard-assembler.service';

describe('브리더 대시보드 조회 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
        countPendingApplications: jest.fn(),
        findRecentApplications: jest.fn(),
        countActiveAvailablePets: jest.fn(),
    };

    const useCase = new GetBreederManagementDashboardUseCase(
        breederManagementProfilePort as any,
        new BreederManagementDashboardAssemblerService(),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        name: '행복브리더',
        verification: { status: 'approved', plan: 'basic' },
        stats: {
            totalApplications: 10,
            completedAdoptions: 3,
            averageRating: 4.5,
            totalReviews: 5,
            profileViews: 100,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 대시보드 정보를 반환한다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        breederManagementProfilePort.countPendingApplications.mockResolvedValue(2);
        breederManagementProfilePort.findRecentApplications.mockResolvedValue([]);
        breederManagementProfilePort.countActiveAvailablePets.mockResolvedValue(5);

        const result = await useCase.execute('breeder-1');

        expect(result.statisticsInfo.pendingApplicationCount).toBe(2);
        expect(result.statisticsInfo.totalApplicationCount).toBe(10);
        expect(result.availablePetCount).toBe(5);
        expect(result.recentApplicationList).toEqual([]);
        expect(breederManagementProfilePort.findById).toHaveBeenCalledWith('breeder-1');
    });

    it('최근 신청 목록이 있으면 함께 반환한다', async () => {
        const recentApplications = [
            { _id: 'app-1', adopterName: '입양자1', petName: '뭉치', status: 'pending', appliedAt: new Date() },
        ];
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        breederManagementProfilePort.countPendingApplications.mockResolvedValue(1);
        breederManagementProfilePort.findRecentApplications.mockResolvedValue(recentApplications);
        breederManagementProfilePort.countActiveAvailablePets.mockResolvedValue(3);

        const result = await useCase.execute('breeder-1');

        expect(result.recentApplicationList).toHaveLength(1);
        expect(result.recentApplicationList[0].applicationId).toBe('app-1');
    });

    it('브리더를 찾을 수 없으면 도메인 not found 예외를 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더 정보를 찾을 수 없습니다.');
        expect(breederManagementProfilePort.countPendingApplications).not.toHaveBeenCalled();
    });
});
