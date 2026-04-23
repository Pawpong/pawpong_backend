import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { GetDistrictByIdAdminUseCase } from '../../../application/use-cases/get-district-by-id-admin.use-case';
import { DistrictAdminResultMapperService } from '../../../../domain/services/district-admin-result-mapper.service';

describe('지역 ID 조회 유스케이스 (관리자)', () => {
    const districtAdminReader = {
        findById: jest.fn(),
    };

    const useCase = new GetDistrictByIdAdminUseCase(districtAdminReader as any, new DistrictAdminResultMapperService());

    const mockDistrict = {
        id: 'district-1',
        city: '경기도',
        districts: ['수원시', '성남시'],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('존재하는 지역 ID로 조회하면 상세 정보를 반환한다', async () => {
        districtAdminReader.findById.mockResolvedValue(mockDistrict);

        const result = await useCase.execute('district-1');

        expect(result.id).toBe('district-1');
        expect(result.city).toBe('경기도');
        expect(result.districts).toEqual(['수원시', '성남시']);
        expect(districtAdminReader.findById).toHaveBeenCalledWith('district-1');
    });

    it('존재하지 않는 ID 조회 시 DomainNotFoundError를 던진다', async () => {
        districtAdminReader.findById.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
            'ID nonexistent-id에 해당하는 지역을 찾을 수 없습니다.',
        );
    });
});
