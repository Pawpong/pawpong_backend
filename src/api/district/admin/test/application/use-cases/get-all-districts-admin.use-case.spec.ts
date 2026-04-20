import { GetAllDistrictsAdminUseCase } from '../../../application/use-cases/get-all-districts-admin.use-case';
import { DistrictAdminResultMapperService } from '../../../../domain/services/district-admin-result-mapper.service';
import { DistrictAdminReaderPort, DistrictSnapshot } from '../../../application/ports/district-admin-reader.port';

function makeSnapshot(overrides: Partial<DistrictSnapshot> = {}): DistrictSnapshot {
    return {
        id: 'd-1',
        city: '서울',
        districts: ['강남구', '서초구'],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

function makeReader(districts: DistrictSnapshot[] = []): DistrictAdminReaderPort {
    return {
        readAll: jest.fn().mockResolvedValue(districts),
        findById: jest.fn(),
        findByCity: jest.fn(),
    };
}

describe('어드민 지역 전체 조회 유스케이스', () => {
    const resultMapper = new DistrictAdminResultMapperService();

    it('모든 지역 목록을 반환한다', async () => {
        const useCase = new GetAllDistrictsAdminUseCase(
            makeReader([makeSnapshot(), makeSnapshot({ id: 'd-2', city: '부산' })]),
            resultMapper,
        );

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result[0].city).toBe('서울');
    });

    it('지역이 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetAllDistrictsAdminUseCase(makeReader([]), resultMapper);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('결과에 id, city, districts 필드를 포함한다', async () => {
        const useCase = new GetAllDistrictsAdminUseCase(makeReader([makeSnapshot()]), resultMapper);

        const result = await useCase.execute();

        expect(result[0]).toMatchObject({ id: 'd-1', city: '서울', districts: ['강남구', '서초구'] });
    });
});
