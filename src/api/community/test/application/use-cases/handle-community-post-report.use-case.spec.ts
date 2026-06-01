import { BadRequestException } from '@nestjs/common';

import { GetCommunityPostReportsUseCase } from '../../../admin/application/use-cases/get-community-post-reports.use-case';
import { HandleCommunityPostReportUseCase } from '../../../admin/application/use-cases/handle-community-post-report.use-case';

const reportAdminReader = {
    findReports: jest.fn(),
    findReportById: jest.fn(),
};

const reportAdminWriter = {
    updateReportStatus: jest.fn(),
    hidePost: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('GetCommunityPostReportsUseCase', () => {
    const useCase = new GetCommunityPostReportsUseCase(reportAdminReader as any);

    it('status 필터 없이 전체 목록 반환', async () => {
        reportAdminReader.findReports.mockResolvedValueOnce({ items: [], totalItems: 0 });
        const result = await useCase.execute({ page: 1, pageSize: 10 });
        expect(reportAdminReader.findReports).toHaveBeenCalledWith({ skip: 0, limit: 10, status: undefined });
        expect(result.pagination.totalItems).toBe(0);
    });

    it('status=pending 필터 적용', async () => {
        reportAdminReader.findReports.mockResolvedValueOnce({ items: [], totalItems: 0 });
        await useCase.execute({ page: 1, pageSize: 10, status: 'pending' });
        expect(reportAdminReader.findReports).toHaveBeenCalledWith({ skip: 0, limit: 10, status: 'pending' });
    });
});

describe('HandleCommunityPostReportUseCase', () => {
    const useCase = new HandleCommunityPostReportUseCase(
        reportAdminReader as any,
        reportAdminWriter as any,
    );

    const pendingReport = {
        reportId: 'r-1',
        postId: 'p-1',
        reporterId: 'u-1',
        reporterNickname: '닉네임',
        reason: 'spam' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
    };

    it('존재하지 않는 신고 → BadRequestException', async () => {
        reportAdminReader.findReportById.mockResolvedValueOnce(null);
        await expect(useCase.execute('r-x', 'admin-1', 'resolve')).rejects.toThrow(BadRequestException);
        expect(reportAdminWriter.updateReportStatus).not.toHaveBeenCalled();
    });

    it('이미 처리된 신고(resolved) → BadRequestException', async () => {
        reportAdminReader.findReportById.mockResolvedValueOnce({ ...pendingReport, status: 'resolved' });
        await expect(useCase.execute('r-1', 'admin-1', 'resolve')).rejects.toThrow(BadRequestException);
    });

    it('이미 처리된 신고(dismissed) → BadRequestException', async () => {
        reportAdminReader.findReportById.mockResolvedValueOnce({ ...pendingReport, status: 'dismissed' });
        await expect(useCase.execute('r-1', 'admin-1', 'dismiss')).rejects.toThrow(BadRequestException);
    });

    it('resolve → hidePost + updateReportStatus(resolved) 호출', async () => {
        reportAdminReader.findReportById.mockResolvedValueOnce(pendingReport);
        reportAdminWriter.hidePost.mockResolvedValueOnce(undefined);
        reportAdminWriter.updateReportStatus.mockResolvedValueOnce(undefined);

        const result = await useCase.execute('r-1', 'admin-1', 'resolve');

        expect(reportAdminWriter.hidePost).toHaveBeenCalledWith('p-1');
        expect(reportAdminWriter.updateReportStatus).toHaveBeenCalledWith(
            'r-1',
            expect.objectContaining({ status: 'resolved', resolvedByAdminId: 'admin-1' }),
        );
        expect(result).toEqual({ reportId: 'r-1', action: 'resolve', postId: 'p-1' });
    });

    it('dismiss → hidePost 미호출 + updateReportStatus(dismissed) 호출', async () => {
        reportAdminReader.findReportById.mockResolvedValueOnce(pendingReport);
        reportAdminWriter.updateReportStatus.mockResolvedValueOnce(undefined);

        const result = await useCase.execute('r-1', 'admin-1', 'dismiss');

        expect(reportAdminWriter.hidePost).not.toHaveBeenCalled();
        expect(reportAdminWriter.updateReportStatus).toHaveBeenCalledWith(
            'r-1',
            expect.objectContaining({ status: 'dismissed', resolvedByAdminId: 'admin-1' }),
        );
        expect(result).toEqual({ reportId: 'r-1', action: 'dismiss', postId: 'p-1' });
    });
});
