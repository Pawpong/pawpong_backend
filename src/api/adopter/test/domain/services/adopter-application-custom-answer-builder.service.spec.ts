import { DomainValidationError } from '../../../../../common/error/domain.error';
import { AdopterApplicationCustomAnswerBuilderService } from '../../../domain/services/adopter-application-custom-answer-builder.service';

describe('AdopterApplicationCustomAnswerBuilderService', () => {
    const service = new AdopterApplicationCustomAnswerBuilderService();

    const customQuestions = [
        { id: 'q1', label: '질문1', type: 'text' },
        { id: 'q2', label: '질문2', type: 'boolean' },
    ] as any[];

    it('각 응답에 questionLabel과 questionType을 포함한다', () => {
        const result = service.build(
            { customResponses: [{ questionId: 'q1', answer: '답변' }] } as any,
            customQuestions,
        );
        expect(result).toHaveLength(1);
        expect(result[0].questionLabel).toBe('질문1');
        expect(result[0].questionType).toBe('text');
    });

    it('존재하지 않는 questionId는 DomainValidationError를 던진다', () => {
        expect(() =>
            service.build({ customResponses: [{ questionId: 'q-unknown', answer: 'x' }] } as any, customQuestions),
        ).toThrow(DomainValidationError);
    });

    it('answer가 undefined면 DomainValidationError', () => {
        expect(() =>
            service.build({ customResponses: [{ questionId: 'q1', answer: undefined }] } as any, customQuestions),
        ).toThrow(DomainValidationError);
    });

    it('customResponses가 없으면 빈 배열', () => {
        expect(service.build({} as any, customQuestions)).toEqual([]);
    });
});
