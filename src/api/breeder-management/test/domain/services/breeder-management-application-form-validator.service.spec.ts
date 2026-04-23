import { DomainValidationError } from '../../../../../common/error/domain.error';
import { BreederManagementApplicationFormValidatorService } from '../../../domain/services/breeder-management-application-form-validator.service';

describe('BreederManagementApplicationFormValidatorService', () => {
    const service = new BreederManagementApplicationFormValidatorService();

    describe('validateCustomQuestions', () => {
        it('중복 id면 예외', () => {
            expect(() =>
                service.validateCustomQuestions(
                    { customQuestions: [{ id: 'a' } as any, { id: 'a' } as any] } as any,
                    [],
                ),
            ).toThrow(/중복/);
        });

        it('표준 질문 id와 충돌하면 예외', () => {
            expect(() =>
                service.validateCustomQuestions({ customQuestions: [{ id: 'privacyConsent' } as any] } as any, [
                    'privacyConsent',
                ]),
            ).toThrow(/표준 질문과 중복/);
        });

        it('문제 없으면 통과', () => {
            expect(() =>
                service.validateCustomQuestions({ customQuestions: [{ id: 'custom1' } as any] } as any, ['std1']),
            ).not.toThrow();
        });
    });

    describe('toStoredQuestions', () => {
        it('모든 필드를 포함하여 변환', () => {
            const result = service.toStoredQuestions({
                customQuestions: [
                    {
                        id: 'c1',
                        type: 'text',
                        label: 'l',
                        required: true,
                        options: ['a'],
                        placeholder: 'p',
                        order: 1,
                    } as any,
                ],
            } as any);
            expect(result[0]).toEqual({
                id: 'c1',
                type: 'text',
                label: 'l',
                required: true,
                options: ['a'],
                placeholder: 'p',
                order: 1,
            });
        });
    });
});
