import { BreederSearchCriteriaService } from '../../../domain/services/breeder-search-criteria.service';

describe('BreederSearchCriteriaService', () => {
    const service = new BreederSearchCriteriaService();

    it('기본 필터(approved + active)를 설정한다', () => {
        const { filter } = service.build({} as any);
        expect(filter['verification.status']).toBe('approved');
        expect(filter.status).toBe('active');
    });

    it('petType, cityName, districtName 필터를 반영한다', () => {
        const { filter } = service.build({ petType: 'dog', cityName: '서울', districtName: '강남구' } as any);
        expect(filter['profile.specialization']).toBe('dog');
        expect(filter['profile.location.city']).toBe('서울');
        expect(filter['profile.location.district']).toBe('강남구');
    });

    it('breedName은 정규식으로 변환한다', () => {
        const { filter } = service.build({ breedName: '푸들' } as any);
        expect(filter['availablePets.breed']).toBeInstanceOf(RegExp);
    });

    it('min/maxPrice는 $gte/$lte를 구성한다', () => {
        const { filter } = service.build({ minPrice: 100, maxPrice: 500 } as any);
        expect(filter['profile.priceRange.min']).toEqual({ $gte: 100, $lte: 500 });
    });

    it('isImmediatelyAvailable가 true면 availablePets.status=available', () => {
        const { filter } = service.build({ isImmediatelyAvailable: true } as any);
        expect(filter['availablePets.status']).toBe('available');
    });

    it('sortCriteria에 따라 정렬이 달라진다', () => {
        expect(service.build({ sortCriteria: 'experience' } as any).sortOrder).toEqual({
            'profile.experienceYears': -1,
        });
        expect(service.build({ sortCriteria: 'recent' } as any).sortOrder).toEqual({ createdAt: -1 });
        expect(service.build({ sortCriteria: 'applications' } as any).sortOrder).toEqual({
            'stats.totalApplications': -1,
        });
        expect(service.build({} as any).sortOrder).toEqual({ 'stats.averageRating': -1 });
    });
});
