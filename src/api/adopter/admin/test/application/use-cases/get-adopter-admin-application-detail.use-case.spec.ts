import { ApplicationStatus } from '../../../../../../common/enum/user.enum';
import { AdopterAdminApplicationDetailPresentationService } from '../../../domain/services/adopter-admin-application-detail-presentation.service';
import { AdopterAdminPolicyService } from '../../../domain/services/adopter-admin-policy.service';
import { AdopterAdminReaderPort } from '../../../application/ports/adopter-admin-reader.port';
import { GetAdopterAdminApplicationDetailUseCase } from '../../../application/use-cases/get-adopter-admin-application-detail.use-case';

describe('입양자 관리자 입양 신청 상세 조회 유스케이스', () => {
    it('입양 신청 상세 응답 계약을 유지한다', async () => {
        const useCase = new GetAdopterAdminApplicationDetailUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    adminId: 'admin-1',
                    permissions: {
                        canManageReports: false,
                        canViewStatistics: true,
                    },
                }),
                findReportedReviews: jest.fn(),
                findApplicationList: jest.fn(),
                findApplicationDetail: jest.fn().mockResolvedValue({
                    applicationId: '507f1f77bcf86cd799439011',
                    adopterName: '홍길동',
                    adopterEmail: 'adopter@test.com',
                    adopterPhone: '010-0000-0000',
                    breederId: 'breeder-1',
                    breederName: '브리더',
                    petName: '포포',
                    status: ApplicationStatus.CONSULTATION_PENDING,
                    standardResponses: {
                        privacyConsent: true,
                    },
                    customResponses: [],
                    appliedAt: new Date('2026-04-06T00:00:00.000Z'),
                }),
            } as AdopterAdminReaderPort,
            new AdopterAdminPolicyService(),
            new AdopterAdminApplicationDetailPresentationService(),
        );

        await expect(useCase.execute('admin-1', '507f1f77bcf86cd799439011')).resolves.toMatchObject({
            applicationId: '507f1f77bcf86cd799439011',
            breederName: '브리더',
            standardResponses: {
                privacyConsent: true,
            },
        });
    });

    it('존재하지 않는 신청은 예외를 던진다', async () => {
        const useCase = new GetAdopterAdminApplicationDetailUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    adminId: 'admin-1',
                    permissions: {
                        canManageReports: false,
                        canViewStatistics: true,
                    },
                }),
                findReportedReviews: jest.fn(),
                findApplicationList: jest.fn(),
                findApplicationDetail: jest.fn(),
            } as AdopterAdminReaderPort,
            new AdopterAdminPolicyService(),
            new AdopterAdminApplicationDetailPresentationService(),
        );

        await expect(useCase.execute('admin-1', '507f1f77bcf86cd799439011')).rejects.toThrow(
            '해당 입양 신청을 찾을 수 없습니다.',
        );
    });
});
