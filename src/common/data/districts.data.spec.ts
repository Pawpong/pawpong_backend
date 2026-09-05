import { formatLocationLabel } from './districts.data';

describe('formatLocationLabel', () => {
    it('하위 지역이 하나뿐인 특별시·광역시는 district 를 생략한다', () => {
        expect(formatLocationLabel('서울특별시', '서울시')).toBe('서울특별시');
        expect(formatLocationLabel('부산광역시', '부산시')).toBe('부산광역시');
        expect(formatLocationLabel('세종특별자치시', '세종시')).toBe('세종특별자치시');
    });

    it('하위 지역이 둘 이상인 시·도는 district 를 유지한다', () => {
        expect(formatLocationLabel('경기도', '파주시')).toBe('경기도 파주시');
        expect(formatLocationLabel('제주특별자치도', '제주시')).toBe('제주특별자치도 제주시');
        expect(formatLocationLabel('제주특별자치도', '서귀포시')).toBe('제주특별자치도 서귀포시');
    });

    it('값이 비어 있으면 있는 쪽만 반환한다', () => {
        expect(formatLocationLabel('경기도', '')).toBe('경기도');
        expect(formatLocationLabel('경기도', undefined)).toBe('경기도');
        expect(formatLocationLabel('', '파주시')).toBe('파주시');
        expect(formatLocationLabel(undefined, undefined)).toBe('');
    });

    it('앞뒤 공백은 정리한다', () => {
        expect(formatLocationLabel('  경기도 ', ' 파주시 ')).toBe('경기도 파주시');
    });
});
