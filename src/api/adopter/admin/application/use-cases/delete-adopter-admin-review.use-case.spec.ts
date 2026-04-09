import { BadRequestException } from '@nestjs/common';

import { AdopterAdminActivityLogFactoryService } from '../../domain/services/adopter-admin-activity-log-factory.service';
import { AdopterAdminApplicationListAssemblerService } from '../../domain/services/adopter-admin-application-list-assembler.service';
import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminPresentationService } from '../../domain/services/adopter-admin-presentation.service';
import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';
import { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import { AdopterAdminWriterPort } from '../ports/adopter-admin-writer.port';
import { DeleteAdopterAdminReviewUseCase } from './delete-adopter-admin-review.use-case';

describe('입양자 관리자 후기 삭제 유스케이스', () => {
    it('리뷰 숨김과 관리자 로그 기록을 수행한다', async () => {
        const writer: AdopterAdminWriterPort = {
            hideReview: jest.fn().mockResolvedValue({
                reviewId: 'review-1',
                breederId: 'breeder-1',
                breederName: '브리더',
            }),
            appendAdminActivity: jest.fn().mockResolvedValue(undefined),
        };
        const useCase = new DeleteAdopterAdminReviewUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    adminId: 'admin-1',
                    permissions: {
                        canManageReports: true,
                        canViewStatistics: false,
                    },
                }),
                findReportedReviews: jest.fn(),
                findApplicationList: jest.fn(),
                findApplicationDetail: jest.fn(),
            } as AdopterAdminReaderPort,
            writer,
            new AdopterAdminPolicyService(),
            new AdopterAdminActivityLogFactoryService(),
            new AdopterAdminPresentationService(
                new AdopterPaginationAssemblerService(),
                new AdopterAdminApplicationListAssemblerService(),
            ),
        );

        await expect(useCase.execute('admin-1', 'breeder-1', 'review-1')).resolves.toEqual({
            message: 'Review deleted successfully',
        });
        expect(writer.appendAdminActivity).toHaveBeenCalled();
    });

    it('대상이 없으면 예외을 던진다', async () => {
        const useCase = new DeleteAdopterAdminReviewUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    adminId: 'admin-1',
                    permissions: {
                        canManageReports: true,
                        canViewStatistics: false,
                    },
                }),
                findReportedReviews: jest.fn(),
                findApplicationList: jest.fn(),
                findApplicationDetail: jest.fn(),
            } as AdopterAdminReaderPort,
            {
                hideReview: jest.fn().mockResolvedValue(null),
                appendAdminActivity: jest.fn(),
            },
            new AdopterAdminPolicyService(),
            new AdopterAdminActivityLogFactoryService(),
            new AdopterAdminPresentationService(
                new AdopterPaginationAssemblerService(),
                new AdopterAdminApplicationListAssemblerService(),
            ),
        );

        await expect(useCase.execute('admin-1', 'breeder-1', 'review-1')).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });
});
