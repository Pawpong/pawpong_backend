import { GetAllStandardQuestionsUseCase } from '../../../application/use-cases/get-all-standard-questions.use-case';
import { StandardQuestionResultMapperService } from '../../../../domain/services/standard-question-result-mapper.service';
import {
    StandardQuestionReaderPort,
    StandardQuestionSnapshot,
} from '../../../../application/ports/standard-question-reader.port';

function makeSnapshot(overrides: Partial<StandardQuestionSnapshot> = {}): StandardQuestionSnapshot {
    return {
        id: 'q-1',
        type: 'text',
        label: '질문 1',
        required: true,
        order: 1,
        isActive: true,
        ...overrides,
    };
}

function makeReader(questions: StandardQuestionSnapshot[] = []): StandardQuestionReaderPort {
    return {
        readAll: jest.fn().mockResolvedValue(questions),
        readActive: jest.fn(),
        findById: jest.fn(),
    };
}

describe('어드민 표준 질문 전체 조회 유스케이스', () => {
    const resultMapper = new StandardQuestionResultMapperService();

    it('전체 질문 목록을 반환한다', async () => {
        const questions = [
            makeSnapshot({ id: 'q-1', order: 1 }),
            makeSnapshot({ id: 'q-2', order: 2, isActive: false }),
        ];
        const useCase = new GetAllStandardQuestionsUseCase(makeReader(questions), resultMapper);

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('q-1');
    });

    it('비활성 질문도 포함하여 반환한다', async () => {
        const questions = [makeSnapshot({ isActive: false }), makeSnapshot({ id: 'q-2', isActive: true })];
        const useCase = new GetAllStandardQuestionsUseCase(makeReader(questions), resultMapper);

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result.some((q) => !q.isActive)).toBe(true);
    });

    it('질문이 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetAllStandardQuestionsUseCase(makeReader([]), resultMapper);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
