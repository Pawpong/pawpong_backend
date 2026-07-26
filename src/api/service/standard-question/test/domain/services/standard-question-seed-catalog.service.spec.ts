import { StandardQuestionSeedCatalogService } from '../../../domain/services/standard-question-seed-catalog.service';

describe('StandardQuestionSeedCatalogService', () => {
    const service = new StandardQuestionSeedCatalogService();

    it('표준 질문 배열을 반환한다', () => {
        const result = service.getAll();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('label');
    });

    it('반환된 배열은 원본과 독립적이다 (복사본)', () => {
        const first = service.getAll();
        const second = service.getAll();
        expect(first).not.toBe(second);
        expect(first[0]).not.toBe(second[0]);
    });
});
