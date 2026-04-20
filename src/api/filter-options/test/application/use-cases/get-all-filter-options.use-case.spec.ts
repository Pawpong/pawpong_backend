import { GetAllFilterOptionsUseCase } from '../../../application/use-cases/get-all-filter-options.use-case';
import { FilterOptionsCatalogService } from '../../../domain/services/filter-options-catalog.service';

describe('전체 필터 옵션 조회 유스케이스', () => {
    let useCase: GetAllFilterOptionsUseCase;

    beforeEach(() => {
        useCase = new GetAllFilterOptionsUseCase(new FilterOptionsCatalogService());
    });

    it('전체 필터 옵션 카탈로그를 반환한다', async () => {
        const result = await useCase.execute();

        expect(result.breederLevels).toEqual([
            {
                value: 'elite',
                label: '엘리트',
                description: '인증된 전문 브리더',
            },
            {
                value: 'new',
                label: '뉴',
                description: '신규 브리더',
            },
        ]);
        expect(result.sortOptions).toHaveLength(5);
        expect(result.dogSizes).toHaveLength(3);
        expect(result.catFurLengths).toHaveLength(2);
        expect(result.adoptionStatus).toEqual([
            {
                value: true,
                label: '입양 가능',
                description: '현재 입양 가능한 반려동물이 있는 브리더',
            },
        ]);
    });
});
