import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { GetBreederApplicationFormUseCase } from '../../../application/use-cases/get-breeder-application-form.use-case';
import { BreederPublicApplicationFormBuilderService } from '../../../domain/services/breeder-public-application-form-builder.service';

describe('브리더 입양 신청 폼 공개 조회 유스케이스', () => {
    const breederPublicReaderPort = {
        findPublicBreederById: jest.fn(),
    };

    const useCase = new GetBreederApplicationFormUseCase(
        breederPublicReaderPort as any,
        new BreederPublicApplicationFormBuilderService(),
    );

    const mockBreeder = { _id: 'breeder-1', applicationForm: [] };
    const mockBreederWithCustomForm = {
        _id: 'breeder-1',
        applicationForm: [{ id: 'custom-1', type: 'text', label: '반려동물 경험을 알려주세요.', required: false }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('커스텀 질문 없이 표준 질문만 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);

        const result = await useCase.execute('breeder-1');

        expect(result.standardQuestions.length).toBeGreaterThan(0);
        expect(result.customQuestions).toHaveLength(0);
    });

    it('커스텀 질문이 있으면 함께 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreederWithCustomForm);

        const result = await useCase.execute('breeder-1');

        expect(result.customQuestions).toHaveLength(1);
        expect(result.customQuestions[0].id).toBe('custom-1');
    });

    it('브리더를 찾을 수 없으면 DomainNotFoundError를 던진다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더를 찾을 수 없습니다.');
    });
});
