import { BreederManagementApplicationFormAssemblerService } from '../../../domain/services/breeder-management-application-form-assembler.service';

describe('BreederManagementApplicationFormAssemblerService', () => {
    const service = new BreederManagementApplicationFormAssemblerService();

    const standard = Array.from({ length: 3 }, (_, i) => ({
        id: `s${i + 1}`,
        type: 't',
        label: `s${i + 1}`,
        required: true,
        order: i + 1,
        isStandard: true as const,
    }));

    it('custom 질문의 order는 표준 뒤로 이어진다', () => {
        const result = service.toResponse(standard, [
            { id: 'c1', type: 't', label: 'c1', required: false } as any,
            { id: 'c2', type: 't', label: 'c2', required: false } as any,
        ]);
        expect(result.customQuestions[0].order).toBe(4);
        expect(result.customQuestions[1].order).toBe(5);
        expect(result.totalQuestions).toBe(5);
    });

    it('applicationForm이 undefined면 빈 custom 배열', () => {
        const result = service.toResponse(standard, undefined);
        expect(result.customQuestions).toEqual([]);
        expect(result.totalQuestions).toBe(3);
    });
});
