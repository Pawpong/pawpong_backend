import { ReorderStandardQuestionsUseCase } from '../../../application/use-cases/reorder-standard-questions.use-case';
import { StandardQuestionWriterPort } from '../../../application/ports/standard-question-writer.port';

function makeWriter(): StandardQuestionWriterPort {
    return {
        update: jest.fn(),
        updateStatus: jest.fn(),
        reorder: jest.fn().mockResolvedValue(undefined),
        replaceAll: jest.fn(),
    };
}

describe('표준 질문 순서 변경 유스케이스', () => {
    it('순서 변경 후 성공 메시지를 반환한다', async () => {
        const writer = makeWriter();
        const useCase = new ReorderStandardQuestionsUseCase(writer);

        const result = await useCase.execute([
            { id: 'q-1', order: 2 },
            { id: 'q-2', order: 1 },
        ]);

        expect(result.message).toBe('질문 순서가 성공적으로 변경되었습니다.');
    });

    it('순서 변경 데이터를 포트에 전달한다', async () => {
        const writer = makeWriter();
        const useCase = new ReorderStandardQuestionsUseCase(writer);
        const reorderData = [{ id: 'q-1', order: 3 }, { id: 'q-2', order: 1 }];

        await useCase.execute(reorderData);

        expect(writer.reorder).toHaveBeenCalledWith(reorderData);
    });

    it('빈 배열을 전달해도 성공 결과를 반환한다', async () => {
        const useCase = new ReorderStandardQuestionsUseCase(makeWriter());

        const result = await useCase.execute([]);

        expect(result.message).toBeDefined();
    });
});
