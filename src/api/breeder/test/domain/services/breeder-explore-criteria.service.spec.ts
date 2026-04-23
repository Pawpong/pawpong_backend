import { BreederExploreCriteriaService } from '../../../domain/services/breeder-explore-criteria.service';
import { BreederSortBy } from '../../../constants/breeder-search.enum';

describe('BreederExploreCriteriaService', () => {
    const service = new BreederExploreCriteriaService();

    it('기본 필터: approved + active + petType + isTestAccount 제외', () => {
        const result = service.build({ petType: 'dog' } as any);
        expect(result.filter['verification.status']).toBe('approved');
        expect(result.filter.accountStatus).toBe('active');
        expect(result.filter.petType).toBe('dog');
        expect(result.filter.isTestAccount).toEqual({ $ne: true });
    });

    it('breeds 배열을 $in 필터로 구성한다', () => {
        const result = service.build({ petType: 'dog', breeds: ['푸들', '말티즈'] } as any);
        expect(result.filter.breeds).toEqual({ $in: ['푸들', '말티즈'] });
    });

    it('province와 city 둘 다 있으면 $and 조건', () => {
        const result = service.build({ petType: 'dog', province: ['서울'], city: ['강남구'] } as any);
        expect(result.filter.$and).toBeDefined();
    });

    it('province만 있으면 city 필터만', () => {
        const result = service.build({ petType: 'dog', province: ['서울'] } as any);
        expect(result.filter['profile.location.city']).toEqual({ $in: ['서울'] });
    });

    it('breederLevel 배열은 $in 필터', () => {
        const result = service.build({ petType: 'dog', breederLevel: ['elite', 'new'] } as any);
        expect(result.filter['verification.level']).toEqual({ $in: ['elite', 'new'] });
    });

    it('sortBy에 따라 정렬이 변경된다', () => {
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.FAVORITE } as any).sortOrder).toEqual({
            'stats.totalFavorites': -1,
        });
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.REVIEW } as any).sortOrder).toEqual({
            'stats.totalReviews': -1,
        });
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.PRICE_ASC } as any).sortOrder).toEqual({
            'profile.priceRange.min': 1,
        });
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.PRICE_DESC } as any).sortOrder).toEqual({
            'profile.priceRange.max': -1,
        });
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.LATEST } as any).sortOrder).toEqual({
            createdAt: -1,
        });
        expect(service.build({ petType: 'dog' } as any).sortOrder).toEqual({ createdAt: -1 });
    });

    it('page/limit 기본값 (1/20)', () => {
        const result = service.build({ petType: 'dog' } as any);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
    });
});
