import { BreederPublicApplicationFormBuilderService } from '../../../domain/services/breeder-public-application-form-builder.service';

describe('BreederPublicApplicationFormBuilderService', () => {
    const service = new BreederPublicApplicationFormBuilderService();

    it('13개의 표준 질문을 반환한다', () => {
        const result = service.build([]);
        expect(result.standardQuestions).toHaveLength(13);
        expect(result.customQuestions).toHaveLength(0);
        expect(result.totalQuestions).toBe(13);
    });

    it('custom 질문은 표준 질문 뒤에 순서를 잇는다', () => {
        const result = service.build([
            { id: 'c1', type: 'text', label: '커스텀1', required: true } as any,
            { id: 'c2', type: 'text', label: '커스텀2', required: false } as any,
        ]);
        expect(result.customQuestions).toHaveLength(2);
        expect(result.customQuestions[0].order).toBe(14);
        expect(result.customQuestions[1].order).toBe(15);
        expect(result.customQuestions[0].isStandard).toBe(false);
        expect(result.totalQuestions).toBe(15);
    });

    it('customQuestionsSource가 undefined면 빈 배열 처리', () => {
        const result = service.build(undefined as any);
        expect(result.customQuestions).toEqual([]);
    });
});
