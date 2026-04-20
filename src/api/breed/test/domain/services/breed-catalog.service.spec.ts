import { BreedCatalogService } from '../../../domain/services/breed-catalog.service';

describe('BreedCatalogService', () => {
    const service = new BreedCatalogService();

    it('petType과 카테고리 리스트를 응답 형식으로 변환한다', () => {
        const result = service.buildResponse('dog', [
            { category: 'large', categoryDescription: '대형견', breeds: ['리트리버'] },
            { category: 'small', categoryDescription: '소형견', breeds: ['치와와'] },
        ]);
        expect(result.petType).toBe('dog');
        expect(result.categories).toHaveLength(2);
        expect(result.categories[0]).toEqual({ category: 'large', categoryDescription: '대형견', breeds: ['리트리버'] });
    });

    it('빈 카테고리 배열도 처리한다', () => {
        const result = service.buildResponse('cat', []);
        expect(result.categories).toEqual([]);
    });
});
