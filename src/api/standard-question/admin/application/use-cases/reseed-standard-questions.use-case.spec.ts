import { ReseedStandardQuestionsUseCase } from './reseed-standard-questions.use-case';
import { StandardQuestionWriterPort } from '../ports/standard-question-writer.port';
import { StandardQuestionSeedCatalogService } from '../../../domain/services/standard-question-seed-catalog.service';

describe('ReseedStandardQuestionsUseCase', () => {
    it('카탈로그 질문들로 전체 재시딩한다', async () => {
        const standardQuestionWriter: StandardQuestionWriterPort = {
            update: jest.fn(),
            updateStatus: jest.fn(),
            reorder: jest.fn(),
            replaceAll: jest.fn().mockResolvedValue(13),
        };
        const useCase = new ReseedStandardQuestionsUseCase(
            standardQuestionWriter,
            new StandardQuestionSeedCatalogService(),
        );

        await expect(useCase.execute()).resolves.toEqual({
            message: '13개의 표준 질문이 재시딩되었습니다.',
        });
        expect(standardQuestionWriter.replaceAll).toHaveBeenCalled();
    });
});
