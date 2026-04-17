import { GetAdoptionStatusUseCase } from '../../../application/use-cases/get-adoption-status.use-case';
import { FilterOptionsCatalogService } from '../../../domain/services/filter-options-catalog.service';

describe('입양 가능 여부 옵션 조회 유스케이스', () => {
    let useCase: GetAdoptionStatusUseCase;

    beforeEach(() => {
        useCase = new GetAdoptionStatusUseCase(new FilterOptionsCatalogService());
    });

    it('입양 가능 옵션 목록을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toEqual([
            {
                value: true,
                label: '입양 가능',
                description: '현재 입양 가능한 반려동물이 있는 브리더',
            },
        ]);
    });

    it('반환값은 배열 형태다', async () => {
        const result = await useCase.execute();

        expect(Array.isArray(result)).toBe(true);
    });
});
