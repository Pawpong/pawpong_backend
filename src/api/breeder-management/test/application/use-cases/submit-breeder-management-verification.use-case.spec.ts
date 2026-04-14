import { BadRequestException } from '@nestjs/common';

import { VerificationStatus } from '../../../../../common/enum/user.enum';
import { SubmitBreederManagementVerificationUseCase } from '../../../application/use-cases/submit-breeder-management-verification.use-case';
import { BreederManagementVerificationSubmissionMapperService } from '../../../domain/services/breeder-management-verification-submission-mapper.service';
import { BreederManagementVerificationCommandResultMapperService } from '../../../domain/services/breeder-management-verification-command-result-mapper.service';

describe('브리더 인증 신청 제출 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
    };
    const breederManagementSettingsPort = {
        updateVerification: jest.fn(),
    };

    const useCase = new SubmitBreederManagementVerificationUseCase(
        breederManagementProfilePort as any,
        breederManagementSettingsPort as any,
        new BreederManagementVerificationSubmissionMapperService(),
        new BreederManagementVerificationCommandResultMapperService(),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        verification: { status: VerificationStatus.PENDING, plan: 'basic' },
    };

    const mockApprovedBreeder = {
        _id: 'breeder-1',
        verification: { status: VerificationStatus.APPROVED, plan: 'basic' },
    };

    const verificationData = {
        plan: 'basic',
        businessNumber: '123-45-67890',
        businessName: '행복브리더 사업체',
        businessAddress: '서울시 강남구',
        experienceYears: '5',
        specialBreeds: '말티즈',
        facilityDescription: '넓고 쾌적한 환경',
        documents: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 인증 신청을 제출한다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        breederManagementSettingsPort.updateVerification.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', verificationData as any);

        expect(result.message).toBeDefined();
        expect(breederManagementSettingsPort.updateVerification).toHaveBeenCalledWith('breeder-1', expect.any(Object));
    });

    it('이미 인증 완료된 브리더는 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockApprovedBreeder);

        await expect(useCase.execute('breeder-1', verificationData as any)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('breeder-1', verificationData as any)).rejects.toThrow(
            '이미 인증이 완료된 브리더입니다.',
        );
        expect(breederManagementSettingsPort.updateVerification).not.toHaveBeenCalled();
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id', verificationData as any)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id', verificationData as any)).rejects.toThrow(
            '브리더 정보를 찾을 수 없습니다.',
        );
        expect(breederManagementSettingsPort.updateVerification).not.toHaveBeenCalled();
    });
});
