import { GetAllDistrictsUseCase } from '../../../application/use-cases/get-all-districts.use-case';
import { DistrictReaderPort } from '../../../application/ports/district-reader.port';
import { DistrictOrderingService } from '../../../domain/services/district-ordering.service';
import type { DistrictPublicResult } from '../../../application/types/district-result.type';

function makeDistrictReader(districts: DistrictPublicResult[] = []): DistrictReaderPort {
    return {
        readAll: jest.fn().mockResolvedValue(districts),
    };
}

describe('지역 목록 조회 유스케이스', () => {
    let useCase: GetAllDistrictsUseCase;
    let districtReader: DistrictReaderPort;
    const orderingService = new DistrictOrderingService();

    beforeEach(() => {
        districtReader = makeDistrictReader();
        useCase = new GetAllDistrictsUseCase(districtReader, orderingService);
    });

    it('지역 목록을 표준 도시 순서로 반환한다', async () => {
        districtReader = makeDistrictReader([
            { city: '경기도', districts: ['수원시', '성남시'] },
            { city: '서울특별시', districts: ['강남구', '마포구'] },
            { city: '부산광역시', districts: ['해운대구'] },
        ]);
        useCase = new GetAllDistrictsUseCase(districtReader, orderingService);

        const result = await useCase.execute();

        expect(result[0].city).toBe('서울특별시');
        expect(result[1].city).toBe('부산광역시');
        expect(result[2].city).toBe('경기도');
    });

    it('빈 목록이면 빈 배열을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('표준 목록에 없는 도시는 뒤로 밀린다', async () => {
        districtReader = makeDistrictReader([
            { city: '알수없는도시', districts: ['구1'] },
            { city: '서울특별시', districts: ['강남구'] },
        ]);
        useCase = new GetAllDistrictsUseCase(districtReader, orderingService);

        const result = await useCase.execute();

        expect(result[0].city).toBe('서울특별시');
        expect(result[1].city).toBe('알수없는도시');
    });

    it('지역 구 목록을 원본 그대로 유지한다', async () => {
        districtReader = makeDistrictReader([{ city: '서울특별시', districts: ['강남구', '마포구', '송파구'] }]);
        useCase = new GetAllDistrictsUseCase(districtReader, orderingService);

        const result = await useCase.execute();

        expect(result[0].districts).toEqual(['강남구', '마포구', '송파구']);
    });
});
