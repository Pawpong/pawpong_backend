import { GetDogSizesUseCase } from '../../../application/use-cases/get-dog-sizes.use-case';
import { FilterOptionsCatalogService } from '../../../domain/services/filter-options-catalog.service';

describe('강아지 크기 옵션 조회 유스케이스', () => {
    let useCase: GetDogSizesUseCase;

    beforeEach(() => {
        useCase = new GetDogSizesUseCase(new FilterOptionsCatalogService());
    });

    it('소형·중형·대형 세 가지 크기 옵션을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toEqual([
            { value: 'small', label: '소형견', description: '10kg 미만' },
            { value: 'medium', label: '중형견', description: '10kg ~ 25kg' },
            { value: 'large', label: '대형견', description: '25kg 이상' },
        ]);
    });

    it('크기 옵션은 정확히 3개다', async () => {
        const result = await useCase.execute();

        expect(result).toHaveLength(3);
    });
});
