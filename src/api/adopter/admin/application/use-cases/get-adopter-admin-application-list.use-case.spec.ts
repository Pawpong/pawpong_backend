import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminPresentationService } from '../../domain/services/adopter-admin-presentation.service';
import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';
import { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import { GetAdopterAdminApplicationListUseCase } from './get-adopter-admin-application-list.use-case';

describe('입양자 관리자 입양 신청 목록 조회 유스케이스', () => {
    it('입양 신청 목록 응답 계약을 유지한다', async () => {
        const useCase = new GetAdopterAdminApplicationListUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    adminId: 'admin-1',
                    permissions: {
                        canManageReports: false,
                        canViewStatistics: true,
                    },
                }),
                findReportedReviews: jest.fn(),
                findApplicationList: jest.fn().mockResolvedValue({
                    items: [
                        {
                            applicationId: 'application-1',
                            adopterName: '홍길동',
                            adopterEmail: 'adopter@test.com',
                            adopterPhone: '010-0000-0000',
                            breederId: 'breeder-1',
                            breederName: '브리더',
                            petName: '포포',
                            status: ApplicationStatus.CONSULTATION_PENDING,
                            appliedAt: new Date('2026-04-06T00:00:00.000Z'),
                            processedAt: undefined,
                        },
                    ],
                    totalCount: 1,
                    pendingCount: 1,
                    completedCount: 0,
                    approvedCount: 0,
                    rejectedCount: 0,
                    page: 1,
                    limit: 10,
                }),
                findApplicationDetail: jest.fn(),
            } as AdopterAdminReaderPort,
            new AdopterAdminPolicyService(),
            new AdopterAdminPresentationService(new AdopterPaginationAssemblerService()),
        );

        await expect(useCase.execute('admin-1', { page: 1, limit: 10 })).resolves.toMatchObject({
            applications: [
                {
                    applicationId: 'application-1',
                    breederName: '브리더',
                },
            ],
            totalCount: 1,
            pendingCount: 1,
            currentPage: 1,
            pageSize: 10,
            totalPages: 1,
        });
    });
});
