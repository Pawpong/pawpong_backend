import { DistrictOrderingService } from '../../../domain/services/district-ordering.service';

describe('DistrictOrderingService', () => {
    const service = new DistrictOrderingService();

    it('표준 도시 순서대로 정렬한다', () => {
        const result = service.sortByStandardCityOrder([
            { city: '경기도', districts: [] },
            { city: '서울특별시', districts: [] },
            { city: '부산광역시', districts: [] },
        ] as any);

        expect(result.map((d) => d.city)).toEqual(['서울특별시', '부산광역시', '경기도']);
    });

    it('모든 도시가 표준 리스트에 없으면 원래 순서를 유지한다', () => {
        const result = service.sortByStandardCityOrder([
            { city: '기타1', districts: [] },
            { city: '기타2', districts: [] },
        ] as any);

        expect(result.map((d) => d.city)).toEqual(['기타1', '기타2']);
    });

    it('표준에 없는 도시는 뒤로 밀어낸다', () => {
        const result = service.sortByStandardCityOrder([
            { city: '기타', districts: [] },
            { city: '서울특별시', districts: [] },
        ] as any);

        expect(result.map((d) => d.city)).toEqual(['서울특별시', '기타']);
    });

    it('원본 배열을 변경하지 않는다', () => {
        const original = [
            { city: '경기도', districts: [] },
            { city: '서울특별시', districts: [] },
        ] as any[];
        const originalSnapshot = [...original];

        service.sortByStandardCityOrder(original);

        expect(original).toEqual(originalSnapshot);
    });
});
