import { AdopterFavoriteDetailMapperService } from '../../../domain/services/adopter-favorite-detail-mapper.service';
import { PriceDisplayType } from '../../../../../common/enum/user.enum';

describe('AdopterFavoriteDetailMapperService', () => {
    const service = new AdopterFavoriteDetailMapperService();

    const favorite = {
        favoriteBreederId: 'b-1',
        breederName: '찜 이름',
        breederProfileImageUrl: 'img.png',
        breederLocation: '서울 강남구',
        addedAt: new Date('2026-01-01'),
    } as any;

    it('breeder가 null이면 비활성 기본값을 반환한다', () => {
        const result = service.toResult(favorite, null, '', []);
        expect(result.breederId).toBe('b-1');
        expect(result.isActive).toBe(false);
        expect(result.priceRange.display).toBe(PriceDisplayType.CONSULTATION);
        expect(result.availablePets).toBe(0);
    });

    it('breeder가 있으면 활성 상태와 상세 정보를 포함한다', () => {
        const breeder = {
            _id: { toString: () => 'b-2' },
            name: '브리더',
            profileImageFileName: 'img.png',
            petType: 'dog',
            breeds: ['푸들'],
            verification: { level: 'elite' },
            stats: { averageRating: 4.5, totalReviews: 10 },
            availablePets: [
                { status: 'available', isActive: true },
                { status: 'adopted', isActive: true },
            ],
            profile: {
                location: { city: '서울', district: '강남구' },
                priceRange: { min: 100, max: 300, display: 'range' },
            },
        } as any;

        const result = service.toResult(favorite, breeder, 'url.png', ['rep1.png']);
        expect(result.isActive).toBe(true);
        expect(result.breederLevel).toBe('elite');
        expect(result.representativePhotos).toEqual(['rep1.png']);
        expect(result.availablePets).toBe(1);
        expect(result.location).toBe('서울 강남구');
        expect(result.priceRange.display).toBe('range');
    });

    it('가격 범위가 미설정이면 not_set을 사용한다', () => {
        const breeder = {
            _id: { toString: () => 'b-3' },
            name: '브리더',
            profile: { priceRange: { min: 0, max: 0 } },
        } as any;
        const result = service.toResult(favorite, breeder, '', []);
        expect(result.priceRange.display).toBe('not_set');
    });
});
