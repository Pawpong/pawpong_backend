import { DomainValidationError } from '../../../../../common/error/domain.error';
import { BreederManagementSimpleApplicationFormBuilderService } from '../../../domain/services/breeder-management-simple-application-form-builder.service';

describe('BreederManagementSimpleApplicationFormBuilderService', () => {
    const service = new BreederManagementSimpleApplicationFormBuilderService();

    it('빈 질문을 필터링한다', () => {
        const result = service.build([{ question: '' }, { question: '  ' }, { question: '유효' }]);
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('유효');
    });

    it('5개 초과는 예외', () => {
        const qs = Array.from({ length: 6 }, (_, i) => ({ question: `q-${i}` }));
        expect(() => service.build(qs)).toThrow(/최대 5개/);
    });

    it('중복 질문(대소문자/공백 무시)은 예외', () => {
        expect(() => service.build([{ question: 'Hello' }, { question: ' HELLO ' }])).toThrow(/중복/);
    });

    it('id는 custom_{timestamp}_{index} 포맷', () => {
        const result = service.build([{ question: 'a' }, { question: 'b' }]);
        expect(result[0].id).toMatch(/^custom_\d+_0$/);
        expect(result[1].id).toMatch(/^custom_\d+_1$/);
    });

    it('order는 1부터 시작, type은 textarea, required는 false', () => {
        const result = service.build([{ question: 'a' }]);
        expect(result[0].order).toBe(1);
        expect(result[0].type).toBe('textarea');
        expect(result[0].required).toBe(false);
    });
});
