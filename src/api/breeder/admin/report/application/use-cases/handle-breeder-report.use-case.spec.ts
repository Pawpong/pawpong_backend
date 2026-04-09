import { BadRequestException } from '@nestjs/common';

import { HandleBreederReportUseCase } from './handle-breeder-report.use-case';
import { BreederReportAdminActivityLogFactoryService } from '../../domain/services/breeder-report-admin-activity-log-factory.service';
import { BreederReportAdminPolicyService } from '../../domain/services/breeder-report-admin-policy.service';
import { BreederReportAdminPresentationService } from '../../domain/services/breeder-report-admin-presentation.service';
import { BreederPaginationAssemblerService } from '../../../../domain/services/breeder-pagination-assembler.service';

describe('HandleBreederReportUseCase', () => {
    const reader = {
        findAdminById: jest.fn(),
        getReports: jest.fn(),
        findReportById: jest.fn(),
    };
    const writer = {
        updateReport: jest.fn(),
        appendAdminActivityLog: jest.fn(),
    };

    const useCase = new HandleBreederReportUseCase(
        reader as any,
        writer as any,
        new BreederReportAdminPolicyService(),
        new BreederReportAdminActivityLogFactoryService(),
        new BreederReportAdminPresentationService(new BreederPaginationAssemblerService()),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('신고 승인 시 상태 업데이트와 브리더 제재를 함께 처리한다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            permissions: { canManageBreeders: true },
        });
        reader.findReportById.mockResolvedValue({
            reportId: 'report-1',
            breederId: 'breeder-1',
            breederName: '행복브리더',
            status: 'pending',
        });

        const result = await useCase.execute('admin-1', 'report-1', {
            action: 'resolve',
            adminNotes: '사기 행위 확인',
        });

        expect(writer.updateReport).toHaveBeenCalledWith(
            'breeder-1',
            'report-1',
            expect.objectContaining({
                status: 'resolved',
                adminNotes: '사기 행위 확인',
                suspensionReason: '신고 승인: 사기 행위 확인',
            }),
        );
        expect(writer.appendAdminActivityLog).toHaveBeenCalled();
        expect(result).toMatchObject({
            reportId: 'report-1',
            breederId: 'breeder-1',
            action: 'resolve',
            status: 'resolved',
        });
    });

    it('이미 처리된 신고면 예외를 던진다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            permissions: { canManageBreeders: true },
        });
        reader.findReportById.mockResolvedValue({
            reportId: 'report-1',
            breederId: 'breeder-1',
            breederName: '행복브리더',
            status: 'resolved',
        });

        await expect(
            useCase.execute('admin-1', 'report-1', {
                action: 'resolve',
            }),
        ).rejects.toThrow(new BadRequestException('이미 처리된 신고입니다.'));
    });
});
