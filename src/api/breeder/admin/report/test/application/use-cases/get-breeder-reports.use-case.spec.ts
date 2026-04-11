import { ForbiddenException } from '@nestjs/common';

import { GetBreederReportsUseCase } from '../../../application/use-cases/get-breeder-reports.use-case';
import { BreederReportAdminPolicyService } from '../../../domain/services/breeder-report-admin-policy.service';
import { BreederReportAdminPresentationService } from '../../../domain/services/breeder-report-admin-presentation.service';
import { BreederPaginationAssemblerService } from '../../../../../domain/services/breeder-pagination-assembler.service';

describe('브리더 신고 목록 조회 유스케이스', () => {
    const reader = {
        findAdminById: jest.fn(),
        getReports: jest.fn(),
        findReportById: jest.fn(),
    };

    const useCase = new GetBreederReportsUseCase(
        reader as any,
        new BreederReportAdminPolicyService(),
        new BreederReportAdminPresentationService(new BreederPaginationAssemblerService()),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('권한이 있으면 신고 목록을 페이지네이션 형태로 반환한다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            permissions: { canManageBreeders: true },
        });
        reader.getReports.mockResolvedValue({
            items: [
                {
                    reportId: 'report-1',
                    targetId: 'breeder-1',
                    targetName: '행복브리더',
                    type: 'fraud',
                    description: '사기 의심',
                    status: 'pending',
                    reportedAt: new Date('2024-01-01T00:00:00.000Z'),
                },
            ],
            totalCount: 1,
        });

        await expect(useCase.execute('admin-1', { pageNumber: 1, itemsPerPage: 10 })).resolves.toMatchObject({
            items: [{ reportId: 'report-1', targetId: 'breeder-1' }],
            pagination: {
                totalItems: 1,
                currentPage: 1,
            },
        });
    });

    it('권한이 없으면 예외를 던진다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            permissions: { canManageBreeders: false },
        });

        await expect(useCase.execute('admin-1', {})).rejects.toBeInstanceOf(ForbiddenException);
    });
});
