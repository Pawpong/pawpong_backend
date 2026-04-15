import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { ToggleStandardQuestionStatusUseCase } from '../../../application/use-cases/toggle-standard-question-status.use-case';
import { StandardQuestionResultMapperService } from '../../../../domain/services/standard-question-result-mapper.service';
import { StandardQuestionWriterPort } from '../../../application/ports/standard-question-writer.port';

describe('기본 질문 활성화 상태 변경 유스케이스', () => {
    it('질문이 있으면 활성화 상태를 갱신한 응답을 반환한다', async () => {
        const standardQuestionWriter: StandardQuestionWriterPort = {
            update: jest.fn(),
            updateStatus: jest.fn().mockResolvedValue({
                id: 'privacyConsent',
                type: 'checkbox',
                label: '개인정보 동의',
                required: true,
                order: 1,
                isActive: false,
            }),
            reorder: jest.fn(),
            replaceAll: jest.fn(),
        };
        const useCase = new ToggleStandardQuestionStatusUseCase(
            standardQuestionWriter,
            new StandardQuestionResultMapperService(),
        );

        await expect(useCase.execute('privacyConsent', false)).resolves.toMatchObject({
            id: 'privacyConsent',
            isActive: false,
        });
    });

    it('질문이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new ToggleStandardQuestionStatusUseCase(
            {
                update: jest.fn(),
                updateStatus: jest.fn().mockResolvedValue(null),
                reorder: jest.fn(),
                replaceAll: jest.fn(),
            },
            new StandardQuestionResultMapperService(),
        );

        await expect(useCase.execute('missing', false)).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
