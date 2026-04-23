import { DomainValidationError } from '../../../../../common/error/domain.error';
import { BreederManagementProfileUpdateMapperService } from '../../../domain/services/breeder-management-profile-update-mapper.service';

describe('BreederManagementProfileUpdateMapperService', () => {
    const service = new BreederManagementProfileUpdateMapperService();

    it('profileDescription은 각 라인의 앞뒤 공백을 제거한다', () => {
        const result = service.toUpdateData(
            { profile: {} } as any,
            { profileDescription: '  안녕\n  하세요  ' } as any,
        );
        expect(result['profile.description']).toBe('안녕\n하세요');
    });

    it('locationInfo는 city/district/address로 매핑된다', () => {
        const result = service.toUpdateData(
            { profile: {} } as any,
            { locationInfo: { cityName: '서울', districtName: '강남구', detailAddress: '역삼동' } } as any,
        );
        expect(result['profile.location']).toEqual({ city: '서울', district: '강남구', address: '역삼동' });
    });

    it('profilePhotos가 3장 이하면 통과', () => {
        const result = service.toUpdateData(
            { profile: {} } as any,
            { profilePhotos: ['a.jpg', 'b.jpg', 'c.jpg'] } as any,
        );
        expect(result['profile.representativePhotos']).toHaveLength(3);
    });

    it('profilePhotos가 4장 이상이면 DomainValidationError', () => {
        expect(() =>
            service.toUpdateData({ profile: {} } as any, { profilePhotos: ['a', 'b', 'c', 'd'] } as any),
        ).toThrow(DomainValidationError);
    });

    it('priceRange: min/max 모두 0이면 display는 not_set', () => {
        const result = service.toUpdateData(
            { profile: {} } as any,
            { priceRangeInfo: { minimumPrice: 0, maximumPrice: 0 } } as any,
        );
        expect(result['profile.priceRange']).toEqual({ min: 0, max: 0, display: 'not_set' });
    });

    it('priceRange: min/max 중 하나 이상 > 0이면 display는 range', () => {
        const result = service.toUpdateData(
            { profile: {} } as any,
            { priceRangeInfo: { minimumPrice: 100, maximumPrice: 300 } } as any,
        );
        expect(result['profile.priceRange']).toEqual({ min: 100, max: 300, display: 'range' });
    });

    it('breeder.profile이 없으면 빈 객체로 초기화한다', () => {
        const result = service.toUpdateData({} as any, {} as any);
        expect(result.profile).toEqual({});
    });

    it('선택 필드만 포함한다 (undefined 제외)', () => {
        const result = service.toUpdateData({ profile: {} } as any, { breeds: ['푸들'], experienceYears: 3 } as any);
        expect(result.breeds).toEqual(['푸들']);
        expect(result['profile.experienceYears']).toBe(3);
    });
});
