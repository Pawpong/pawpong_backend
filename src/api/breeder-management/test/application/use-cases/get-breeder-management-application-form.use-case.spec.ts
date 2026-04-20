import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { GetBreederManagementApplicationFormUseCase } from '../../../application/use-cases/get-breeder-management-application-form.use-case';
import { BreederManagementApplicationFormAssemblerService } from '../../../domain/services/breeder-management-application-form-assembler.service';
import { BreederManagementStandardQuestionCatalogService } from '../../../domain/services/breeder-management-standard-question-catalog.service';

describe('브리더 입양 신청 폼 조회 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
    };

    const useCase = new GetBreederManagementApplicationFormUseCase(
        breederManagementProfilePort as any,
        new BreederManagementApplicationFormAssemblerService(),
        new BreederManagementStandardQuestionCatalogService(),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        applicationForm: [],
    };

    const mockBreederWithCustomQuestions = {
        _id: 'breeder-1',
        applicationForm: [
            {
                id: 'custom-1',
                type: 'text',
                label: '반려동물 경험을 설명해주세요.',
                required: false,
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('커스텀 질문 없이 표준 질문만 반환한다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);

        const result = await useCase.execute('breeder-1');

        expect(result.standardQuestions.length).toBeGreaterThan(0);
        expect(result.customQuestions).toHaveLength(0);
        expect(result.totalQuestions).toBe(result.standardQuestions.length);
    });

    it('커스텀 질문이 있으면 표준 질문과 함께 반환한다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreederWithCustomQuestions);

        const result = await useCase.execute('breeder-1');

        expect(result.standardQuestions.length).toBeGreaterThan(0);
        expect(result.customQuestions).toHaveLength(1);
        expect(result.customQuestions[0].isStandard).toBe(false);
        expect(result.totalQuestions).toBe(result.standardQuestions.length + 1);
    });

    it('브리더를 찾을 수 없으면 DomainNotFoundError를 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더 정보를 찾을 수 없습니다.');
    });
});
