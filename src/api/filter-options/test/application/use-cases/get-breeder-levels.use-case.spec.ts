import { GetBreederLevelsUseCase } from '../../../application/use-cases/get-breeder-levels.use-case';
import { FilterOptionsCatalogService } from '../../../domain/services/filter-options-catalog.service';

describe('브리더 레벨 옵션 조회 유스케이스', () => {
    let useCase: GetBreederLevelsUseCase;

    beforeEach(() => {
        useCase = new GetBreederLevelsUseCase(new FilterOptionsCatalogService());
    });

    it('elite와 new 두 가지 레벨 옵션을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toEqual([
            { value: 'elite', label: '엘리트', description: '인증된 전문 브리더' },
            { value: 'new', label: '뉴', description: '신규 브리더' },
        ]);
    });

    it('레벨 옵션은 정확히 2개다', async () => {
        const result = await useCase.execute();

        expect(result).toHaveLength(2);
    });
});
