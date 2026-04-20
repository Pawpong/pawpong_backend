import { StandardQuestionResultMapperService } from '../../../domain/services/standard-question-result-mapper.service';

describe('StandardQuestionResultMapperService', () => {
    const service = new StandardQuestionResultMapperService();

    it('snapshot을 result로 매핑한다', () => {
        const snapshot = {
            id: 'q-1',
            type: 'text',
            label: '이름',
            required: true,
            order: 1,
            isActive: true,
            options: ['a', 'b'],
            placeholder: '예시',
            description: '설명',
        };
        expect(service.toResult(snapshot)).toEqual(snapshot);
    });

    it('선택 필드가 없어도 매핑한다', () => {
        const snapshot = {
            id: 'q-2',
            type: 'text',
            label: '질문',
            required: false,
            order: 2,
            isActive: true,
        };
        const result = service.toResult(snapshot);
        expect(result.options).toBeUndefined();
        expect(result.placeholder).toBeUndefined();
    });
});
