import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { UpdateStandardQuestionUseCase } from '../../../application/use-cases/update-standard-question.use-case';
import { StandardQuestionResultMapperService } from '../../../../domain/services/standard-question-result-mapper.service';
import { StandardQuestionWriterPort } from '../../../application/ports/standard-question-writer.port';

describe('기본 질문 수정 유스케이스', () => {
    it('질문이 있으면 수정된 응답을 반환한다', async () => {
        const standardQuestionWriter: StandardQuestionWriterPort = {
            update: jest.fn().mockResolvedValue({
                id: 'privacyConsent',
                type: 'checkbox',
                label: '수정된 질문',
                required: true,
                order: 1,
                isActive: true,
            }),
            updateStatus: jest.fn(),
            reorder: jest.fn(),
            replaceAll: jest.fn(),
        };
        const useCase = new UpdateStandardQuestionUseCase(
            standardQuestionWriter,
            new StandardQuestionResultMapperService(),
        );

        await expect(useCase.execute('privacyConsent', { label: '수정된 질문' })).resolves.toMatchObject({
            id: 'privacyConsent',
            label: '수정된 질문',
        });
    });

    it('질문이 없으면 예외를 던진다', async () => {
        const useCase = new UpdateStandardQuestionUseCase(
            {
                update: jest.fn().mockResolvedValue(null),
                updateStatus: jest.fn(),
                reorder: jest.fn(),
                replaceAll: jest.fn(),
            },
            new StandardQuestionResultMapperService(),
        );

        await expect(useCase.execute('missing', { label: '수정' })).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
