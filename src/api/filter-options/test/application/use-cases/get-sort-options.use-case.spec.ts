import { GetSortOptionsUseCase } from '../../../application/use-cases/get-sort-options.use-case';
import { FilterOptionsCatalogService } from '../../../domain/services/filter-options-catalog.service';

describe('정렬 옵션 조회 유스케이스', () => {
    let useCase: GetSortOptionsUseCase;

    beforeEach(() => {
        useCase = new GetSortOptionsUseCase(new FilterOptionsCatalogService());
    });

    it('5가지 정렬 옵션을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toHaveLength(5);
    });

    it('최신순·찜 많은순·후기 많은순·오름차순·내림차순 옵션을 포함한다', async () => {
        const result = await useCase.execute();
        const values = result.map((o) => o.value);

        expect(values).toContain('latest');
        expect(values).toContain('favorite');
        expect(values).toContain('review');
        expect(values).toContain('price_asc');
        expect(values).toContain('price_desc');
    });
});
