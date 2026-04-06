import { BadRequestException } from '@nestjs/common';

import { UpdateStandardQuestionUseCase } from './update-standard-question.use-case';
import { StandardQuestionPresentationService } from '../../../domain/services/standard-question-presentation.service';
import { StandardQuestionWriterPort } from '../ports/standard-question-writer.port';

describe('UpdateStandardQuestionUseCase', () => {
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
            new StandardQuestionPresentationService(),
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
            new StandardQuestionPresentationService(),
        );

        await expect(useCase.execute('missing', { label: '수정' })).rejects.toBeInstanceOf(BadRequestException);
    });
});
