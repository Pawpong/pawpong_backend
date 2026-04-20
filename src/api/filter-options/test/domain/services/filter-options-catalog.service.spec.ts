import { FilterOptionsCatalogService } from '../../../domain/services/filter-options-catalog.service';

describe('FilterOptionsCatalogService', () => {
    const service = new FilterOptionsCatalogService();

    it('모든 옵션 카테고리를 포함한다', () => {
        const result = service.getAll();
        expect(result).toHaveProperty('breederLevels');
        expect(result).toHaveProperty('sortOptions');
        expect(result).toHaveProperty('dogSizes');
        expect(result).toHaveProperty('catFurLengths');
        expect(result).toHaveProperty('adoptionStatus');
    });

    it('breederLevels는 elite와 new 2개를 포함한다', () => {
        const result = service.getBreederLevels();
        expect(result.map((o) => o.value)).toEqual(['elite', 'new']);
    });

    it('sortOptions은 5가지 정렬을 포함한다', () => {
        const result = service.getSortOptions();
        expect(result.map((o) => o.value)).toEqual(['latest', 'favorite', 'review', 'price_asc', 'price_desc']);
    });

    it('dogSizes는 3가지 크기를 포함한다', () => {
        const result = service.getDogSizes();
        expect(result.map((o) => o.value)).toEqual(['small', 'medium', 'large']);
    });

    it('catFurLengths는 short/long 2가지를 포함한다', () => {
        const result = service.getCatFurLengths();
        expect(result.map((o) => o.value)).toEqual(['short', 'long']);
    });

    it('adoptionStatus는 true 1개를 포함한다', () => {
        const result = service.getAdoptionStatus();
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(true);
    });

    it('각 옵션은 value/label/description 필드를 가진다', () => {
        const level = service.getBreederLevels()[0];
        expect(level).toHaveProperty('value');
        expect(level).toHaveProperty('label');
        expect(level).toHaveProperty('description');
    });
});
