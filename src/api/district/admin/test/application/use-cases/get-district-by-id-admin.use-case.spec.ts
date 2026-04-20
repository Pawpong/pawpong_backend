import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { GetDistrictByIdAdminUseCase } from '../../../application/use-cases/get-district-by-id-admin.use-case';
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

function makeReader(district: DistrictSnapshot | null = makeSnapshot()): DistrictAdminReaderPort {
    return {
        readAll: jest.fn(),
        findById: jest.fn().mockResolvedValue(district),
        findByCity: jest.fn(),
    };
}

describe('어드민 지역 ID 조회 유스케이스', () => {
    const resultMapper = new DistrictAdminResultMapperService();

    it('ID로 지역 정보를 반환한다', async () => {
        const useCase = new GetDistrictByIdAdminUseCase(makeReader(), resultMapper);

        const result = await useCase.execute('d-1');

        expect(result.id).toBe('d-1');
        expect(result.city).toBe('서울');
    });

    it('존재하지 않는 ID는 DomainNotFoundError를 던진다', async () => {
        const useCase = new GetDistrictByIdAdminUseCase(makeReader(null), resultMapper);

        await expect(useCase.execute('not-found')).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
