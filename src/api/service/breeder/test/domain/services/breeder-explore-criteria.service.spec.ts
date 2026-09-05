import { BreederExploreCriteriaService } from '../../../domain/services/breeder-explore-criteria.service';
import { BreederSortBy } from '../../../constants/breeder-search.enum';
import { PetType } from '../../../../../../common/enum/user.enum';

describe('BreederExploreCriteriaService', () => {
    const service = new BreederExploreCriteriaService();

    it('기본 필터: approved + active + petType + isTestAccount 제외', () => {
        const result = service.build({ petType: 'dog' });
        expect(result.filter['verification.status']).toBe('approved');
        expect(result.filter.accountStatus).toBe('active');
        expect(result.filter.petType).toBe('dog');
        expect(result.filter.isTestAccount).toEqual({ $ne: true });
    });

    it('breeds 배열을 $in 필터로 구성한다', () => {
        const result = service.build({ petType: 'dog', breeds: ['푸들', '말티즈'] });
        expect(result.filter.breeds).toEqual({ $in: ['푸들', '말티즈'] });
    });

    it('파충류 브리더 타입을 그대로 필터에 반영한다', () => {
        const result = service.build({ petType: PetType.REPTILE });
        expect(result.filter.petType).toBe('reptile');
    });

    it('keyword는 브리더명/품종/지역을 $or 부분 일치로 검색한다', () => {
        const result = service.build({ petType: 'dog', keyword: '말티즈' });
        const or = result.filter.$or as Array<Record<string, RegExp>>;
        expect(or.map((condition) => Object.keys(condition)[0])).toEqual([
            'name',
            'breeds',
            'profile.location.city',
            'profile.location.district',
        ]);
        expect(or[0].name.test('말티즈 브리더')).toBe(true);
        expect(or[0].name.test('푸들 브리더')).toBe(false);
    });

    it('keyword의 정규식 메타문자는 리터럴로 취급한다', () => {
        const result = service.build({ petType: 'dog', keyword: '.*' });
        const or = result.filter.$or as Array<Record<string, RegExp>>;
        expect(or[0].name.test('아무 브리더')).toBe(false);
        expect(or[0].name.test('브리더.*하우스')).toBe(true);
    });

    it('공백뿐인 keyword는 필터를 만들지 않는다', () => {
        expect(service.build({ petType: 'dog', keyword: '   ' }).filter.$or).toBeUndefined();
    });

    it('province와 city 둘 다 있으면 $and 조건', () => {
        const result = service.build({ petType: 'dog', province: ['서울'], city: ['강남구'] });
        expect(result.filter.$and).toBeDefined();
    });

    it('province만 있으면 city 필터만', () => {
        const result = service.build({ petType: 'dog', province: ['서울'] });
        expect(result.filter['profile.location.city']).toEqual({ $in: ['서울'] });
    });

    it('sortBy에 따라 정렬이 변경된다', () => {
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.FAVORITE }).sortOrder).toEqual({
            'stats.totalFavorites': -1,
        });
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.REVIEW }).sortOrder).toEqual({
            'stats.totalReviews': -1,
        });
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.PRICE_ASC }).sortOrder).toEqual({
            'profile.priceRange.min': 1,
        });
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.PRICE_DESC }).sortOrder).toEqual({
            'profile.priceRange.max': -1,
        });
        expect(service.build({ petType: 'dog', sortBy: BreederSortBy.LATEST }).sortOrder).toEqual({
            createdAt: -1,
        });
        expect(service.build({ petType: 'dog' }).sortOrder).toEqual({ createdAt: -1 });
    });

    it('page/limit 기본값 (1/20)', () => {
        const result = service.build({ petType: 'dog' });
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
    });
});
