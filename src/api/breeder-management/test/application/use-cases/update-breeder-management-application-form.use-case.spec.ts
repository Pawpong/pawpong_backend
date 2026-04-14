import { BadRequestException } from '@nestjs/common';

import { UpdateBreederManagementApplicationFormUseCase } from '../../../application/use-cases/update-breeder-management-application-form.use-case';
import { BreederManagementApplicationFormValidatorService } from '../../../domain/services/breeder-management-application-form-validator.service';
import { BreederManagementApplicationCommandResultMapperService } from '../../../domain/services/breeder-management-application-command-result-mapper.service';

describe('브리더 입양 신청 폼 수정 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
    };
    const breederManagementSettingsPort = {
        updateApplicationForm: jest.fn(),
    };

    const useCase = new UpdateBreederManagementApplicationFormUseCase(
        breederManagementProfilePort as any,
        breederManagementSettingsPort as any,
        new BreederManagementApplicationFormValidatorService(),
        new BreederManagementApplicationCommandResultMapperService(),
    );

    const mockBreeder = { _id: 'breeder-1', applicationForm: [] };
    const validUpdateDto = {
        customQuestions: [
            { id: 'custom-1', type: 'text', label: '반려동물 경험', required: false },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 입양 신청 폼을 수정한다', async () => {
        const updatedQuestions = [{ id: 'custom-1', type: 'text', label: '반려동물 경험', required: false }];
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        breederManagementSettingsPort.updateApplicationForm.mockResolvedValue({
            applicationForm: updatedQuestions,
        });

        const result = await useCase.execute('breeder-1', validUpdateDto as any);

        expect(result.message).toBeDefined();
        expect(result.customQuestions).toBeDefined();
        expect(breederManagementSettingsPort.updateApplicationForm).toHaveBeenCalled();
    });

    it('질문 ID가 중복이면 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        const duplicateDto = {
            customQuestions: [
                { id: 'custom-1', type: 'text', label: '질문A', required: false },
                { id: 'custom-1', type: 'text', label: '질문B', required: false },
            ],
        };

        await expect(useCase.execute('breeder-1', duplicateDto as any)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('breeder-1', duplicateDto as any)).rejects.toThrow('질문 ID가 중복되었습니다.');
    });

    it('표준 질문 ID와 충돌하면 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        const conflictDto = {
            customQuestions: [{ id: 'privacyConsent', type: 'text', label: '충돌 질문', required: false }],
        };

        await expect(useCase.execute('breeder-1', conflictDto as any)).rejects.toThrow(BadRequestException);
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id', validUpdateDto as any)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id', validUpdateDto as any)).rejects.toThrow(
            '브리더 정보를 찾을 수 없습니다.',
        );
        expect(breederManagementSettingsPort.updateApplicationForm).not.toHaveBeenCalled();
    });
});
