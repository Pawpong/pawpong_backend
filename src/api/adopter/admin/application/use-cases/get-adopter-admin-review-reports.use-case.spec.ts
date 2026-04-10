import { ForbiddenException } from '@nestjs/common';

import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminReviewReportPresentationService } from '../../domain/services/adopter-admin-review-report-presentation.service';
import { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import { GetAdopterAdminReviewReportsUseCase } from './get-adopter-admin-review-reports.use-case';

describe('입양자 관리자 후기 신고 목록 조회 유스케이스', () => {
    it('후기 신고 목록 응답 계약을 유지한다', async () => {
        const reader: AdopterAdminReaderPort = {
            findAdminById: jest.fn().mockResolvedValue({
                adminId: 'admin-1',
                permissions: {
                    canManageReports: true,
                    canViewStatistics: false,
                },
            }),
            findReportedReviews: jest.fn().mockResolvedValue({
                items: [
                    {
                        reviewId: 'review-1',
                        breederId: 'breeder-1',
                        breederName: '브리더',
                        authorId: 'author-1',
                        authorName: '작성자',
                        reportedBy: 'reporter-1',
                        reporterName: '신고자',
                        reportReason: 'inappropriate_content',
                        reportDescription: '부적절함',
                        reportedAt: new Date('2026-04-06T00:00:00.000Z'),
                        content: '리뷰 내용',
                        writtenAt: new Date('2026-04-05T00:00:00.000Z'),
                        isVisible: true,
                    },
                ],
                totalCount: 1,
                page: 1,
                limit: 10,
            }),
            findApplicationList: jest.fn(),
            findApplicationDetail: jest.fn(),
        };
        const useCase = new GetAdopterAdminReviewReportsUseCase(
            reader,
            new AdopterAdminPolicyService(),
            new AdopterAdminReviewReportPresentationService(),
        );

        await expect(useCase.execute('admin-1')).resolves.toMatchObject({
            items: [
                {
                    reviewId: 'review-1',
                    breederId: 'breeder-1',
                    reporterName: '신고자',
                },
            ],
            pagination: {
                currentPage: 1,
                pageSize: 10,
                totalItems: 1,
                totalPages: 1,
            },
        });
    });

    it('권한이 없으면 예외을 던진다', async () => {
        const useCase = new GetAdopterAdminReviewReportsUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue(null),
                findReportedReviews: jest.fn(),
                findApplicationList: jest.fn(),
                findApplicationDetail: jest.fn(),
            },
            new AdopterAdminPolicyService(),
            new AdopterAdminReviewReportPresentationService(),
        );

        await expect(useCase.execute('admin-1')).rejects.toBeInstanceOf(ForbiddenException);
    });
});
