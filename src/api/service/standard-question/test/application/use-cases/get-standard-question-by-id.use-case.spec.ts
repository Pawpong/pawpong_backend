import { GetStandardQuestionByIdUseCase } from '../../../application/use-cases/get-standard-question-by-id.use-case';
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

describe('표준 질문 단건 조회 유스케이스', () => {
    const standardQuestionReader = {
        readAll: jest.fn(),
        readActive: jest.fn(),
        findById: jest.fn(),
    };

    const useCase = new GetStandardQuestionByIdUseCase(standardQuestionReader as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('ID에 해당하는 표준 질문을 반환한다', async () => {
        standardQuestionReader.findById.mockResolvedValue(makeSnapshot({ id: 'q-abc' }));

        const result = await useCase.execute('q-abc');

        expect(result).not.toBeNull();
        expect(result!.id).toBe('q-abc');
    });

    it('존재하지 않는 ID면 null을 반환한다', async () => {
        standardQuestionReader.findById.mockResolvedValue(null);

        const result = await useCase.execute('not-found');

        expect(result).toBeNull();
    });

    it('findById 포트에 id를 전달한다', async () => {
        standardQuestionReader.findById.mockResolvedValue(null);

        await useCase.execute('q-xyz');

        expect(standardQuestionReader.findById).toHaveBeenCalledWith('q-xyz');
    });
});
