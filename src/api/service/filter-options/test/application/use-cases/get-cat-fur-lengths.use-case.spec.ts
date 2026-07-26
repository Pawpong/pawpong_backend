import { GetCatFurLengthsUseCase } from '../../../application/use-cases/get-cat-fur-lengths.use-case';
import { FilterOptionsCatalogService } from '../../../domain/services/filter-options-catalog.service';

describe('고양이 털 길이 옵션 조회 유스케이스', () => {
    let useCase: GetCatFurLengthsUseCase;

    beforeEach(() => {
        useCase = new GetCatFurLengthsUseCase(new FilterOptionsCatalogService());
    });

    it('단모와 장모 두 가지 옵션을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toEqual([
            { value: 'short', label: '단모', description: '짧은 털' },
            { value: 'long', label: '장모', description: '긴 털' },
        ]);
    });

    it('털 길이 옵션은 정확히 2개다', async () => {
        const result = await useCase.execute();

        expect(result).toHaveLength(2);
    });
});
