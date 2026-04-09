import { BadRequestException } from '@nestjs/common';

import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminPresentationService } from '../../domain/services/adopter-admin-presentation.service';
import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';
import { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import { GetAdopterAdminApplicationDetailUseCase } from './get-adopter-admin-application-detail.use-case';

describe('GetAdopterAdminApplicationDetailUseCase', () => {
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
            new AdopterAdminPresentationService(new AdopterPaginationAssemblerService()),
        );

        await expect(useCase.execute('admin-1', '507f1f77bcf86cd799439011')).resolves.toMatchObject({
            applicationId: '507f1f77bcf86cd799439011',
            breederName: '브리더',
            standardResponses: {
                privacyConsent: true,
            },
        });
    });

    it('잘못된 ID 형식은 BadRequestException을 던진다', async () => {
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
            new AdopterAdminPresentationService(new AdopterPaginationAssemblerService()),
        );

        await expect(useCase.execute('admin-1', 'invalid-id')).rejects.toBeInstanceOf(BadRequestException);
    });
});
