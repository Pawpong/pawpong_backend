import { GetAllActiveStandardQuestionsUseCase } from '../../../application/use-cases/get-all-active-standard-questions.use-case';
import { StandardQuestionSnapshot } from '../../../application/ports/standard-question-reader.port';

function makeSnapshot(overrides: Partial<StandardQuestionSnapshot> = {}): StandardQuestionSnapshot {
    return {
        id: 'q-1',
        type: 'text',
        label: '질문 레이블',
        required: true,
        order: 1,
        isActive: true,
        ...overrides,
    };
}

describe('활성 표준 질문 목록 조회 유스케이스', () => {
    const standardQuestionReader = {
        readAll: jest.fn(),
        readActive: jest.fn(),
        findById: jest.fn(),
    };

    const useCase = new GetAllActiveStandardQuestionsUseCase(standardQuestionReader as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('활성 표준 질문 목록을 반환한다', async () => {
        standardQuestionReader.readActive.mockResolvedValue([makeSnapshot(), makeSnapshot({ id: 'q-2', order: 2 })]);

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('q-1');
    });

    it('활성 질문이 없으면 빈 배열을 반환한다', async () => {
        standardQuestionReader.readActive.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('readActive 포트를 호출한다', async () => {
        standardQuestionReader.readActive.mockResolvedValue([]);

        await useCase.execute();

        expect(standardQuestionReader.readActive).toHaveBeenCalledTimes(1);
    });
});
