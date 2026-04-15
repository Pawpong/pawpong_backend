import { BadRequestException } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';
import { UpdateBreederManagementSimpleApplicationFormUseCase } from '../../../application/use-cases/update-breeder-management-simple-application-form.use-case';
import { BreederManagementSimpleApplicationFormBuilderService } from '../../../domain/services/breeder-management-simple-application-form-builder.service';
import { BreederManagementApplicationCommandResultMapperService } from '../../../domain/services/breeder-management-application-command-result-mapper.service';

describe('브리더 간편 입양 신청 폼 수정 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
    };
    const breederManagementSettingsPort = {
        updateApplicationForm: jest.fn(),
    };

    const useCase = new UpdateBreederManagementSimpleApplicationFormUseCase(
        breederManagementProfilePort as any,
        breederManagementSettingsPort as any,
        new BreederManagementSimpleApplicationFormBuilderService(),
        new BreederManagementApplicationCommandResultMapperService(),
    );

    const mockBreeder = { _id: 'breeder-1', applicationForm: [] };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 간편 신청 폼을 수정한다', async () => {
        const questions = [{ question: '반려동물 경험이 있으신가요?' }, { question: '주거 형태가 어떻게 되나요?' }];
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        breederManagementSettingsPort.updateApplicationForm.mockResolvedValue({
            applicationForm: [{ id: 'custom_1', label: '반려동물 경험이 있으신가요?' }],
        });

        const result = await useCase.execute('breeder-1', questions);

        expect(result.message).toBeDefined();
        expect(result.customQuestions).toBeDefined();
        expect(result.totalQuestions).toBeDefined();
        expect(breederManagementSettingsPort.updateApplicationForm).toHaveBeenCalled();
    });

    it('커스텀 질문이 5개를 초과하면 도메인 검증 예외를 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        const tooManyQuestions = Array.from({ length: 6 }, (_, i) => ({ question: `질문 ${i + 1}` }));

        await expect(useCase.execute('breeder-1', tooManyQuestions)).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('breeder-1', tooManyQuestions)).rejects.toThrow(
            '커스텀 질문은 최대 5개까지만 추가할 수 있습니다.',
        );
    });

    it('중복 질문이 있으면 도메인 검증 예외를 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        const duplicateQuestions = [{ question: '같은 질문' }, { question: '같은 질문' }];

        await expect(useCase.execute('breeder-1', duplicateQuestions)).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('breeder-1', duplicateQuestions)).rejects.toThrow(
            '중복된 질문이 있습니다. 각 질문은 고유해야 합니다.',
        );
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id', [{ question: '질문' }])).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id', [{ question: '질문' }])).rejects.toThrow(
            '브리더 정보를 찾을 수 없습니다.',
        );
        expect(breederManagementSettingsPort.updateApplicationForm).not.toHaveBeenCalled();
    });
});
