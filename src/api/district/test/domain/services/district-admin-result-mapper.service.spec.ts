import { DistrictAdminResultMapperService } from '../../../domain/services/district-admin-result-mapper.service';
import { DistrictSnapshot } from '../../../admin/application/ports/district-admin-reader.port';

describe('DistrictAdminResultMapperService', () => {
    const service = new DistrictAdminResultMapperService();

    it('DistrictSnapshot을 DistrictAdminResult로 매핑한다', () => {
        const snapshot: DistrictSnapshot = {
            id: 'd-1',
            city: '서울',
            districts: ['강남구', '서초구'],
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-02-01T00:00:00.000Z'),
        };

        const result = service.toResult(snapshot);

        expect(result).toEqual(snapshot);
    });

    it('districts가 빈 배열이어도 매핑한다', () => {
        const snapshot: DistrictSnapshot = {
            id: 'd-2',
            city: '부산',
            districts: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = service.toResult(snapshot);

        expect(result.districts).toEqual([]);
    });
});
