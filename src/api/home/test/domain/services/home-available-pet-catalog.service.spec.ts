import { HomeAvailablePetCatalogService } from '../../../domain/services/home-available-pet-catalog.service';

describe('HomeAvailablePetCatalogService', () => {
    const service = new HomeAvailablePetCatalogService();
    const signedUrl = (name: string) => `https://cdn.example.com/${name}`;

    describe('normalizeLimit', () => {
        it('양수는 그대로 반환한다', () => {
            expect(service.normalizeLimit(20)).toBe(20);
        });

        it('50 초과는 50으로 제한한다', () => {
            expect(service.normalizeLimit(100)).toBe(50);
        });

        it('0 이하는 10으로 대체한다', () => {
            expect(service.normalizeLimit(0)).toBe(10);
            expect(service.normalizeLimit(-5)).toBe(10);
        });

        it('NaN은 10으로 대체한다', () => {
            expect(service.normalizeLimit(NaN)).toBe(10);
        });

        it('기본값은 10이다', () => {
            expect(service.normalizeLimit()).toBe(10);
        });
    });

    describe('buildResults', () => {
        function makePet(overrides: any = {}) {
            return {
                id: 'pet-1',
                name: '초코',
                breed: '푸들',
                breederId: 'b-1',
                breederName: '브리더A',
                price: 300000,
                photos: ['pet/1.jpg'],
                birthDate: new Date('2025-01-01'),
                breederCity: '서울',
                breederDistrict: '강남구',
                ...overrides,
            };
        }

        it('인증된 사용자에게는 price를 제공한다', () => {
            const result = service.buildResults([makePet()], true, signedUrl);
            expect(result[0].price).toBe(300000);
        });

        it('비인증 사용자에게는 price가 null이다', () => {
            const result = service.buildResults([makePet()], false, signedUrl);
            expect(result[0].price).toBeNull();
        });

        it('photos가 없으면 placeholder URL을 사용한다', () => {
            const result = service.buildResults([makePet({ photos: [] })], true, signedUrl);
            expect(result[0].mainPhoto).toContain('placeholder');
        });

        it('breederName이 없으면 기본 문구를 사용한다', () => {
            const result = service.buildResults([makePet({ breederName: undefined })], true, signedUrl);
            expect(result[0].breederName).toBe('브리더 정보 없음');
        });

        it('birthDate가 null이면 ageInMonths는 0', () => {
            const result = service.buildResults([makePet({ birthDate: null })], true, signedUrl);
            expect(result[0].ageInMonths).toBe(0);
            expect(result[0].birthDate).toBeNull();
        });

        it('location 필드를 올바르게 구성한다', () => {
            const result = service.buildResults([makePet()], true, signedUrl);
            expect(result[0].location).toEqual({ city: '서울', district: '강남구' });
        });
    });
});
