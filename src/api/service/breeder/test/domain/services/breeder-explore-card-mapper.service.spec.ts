import { BreederExploreCardMapperService } from '../../../domain/services/breeder-explore-card-mapper.service';

const fileUrlPort = {
    generateOne: jest.fn(),
    generateOneSafe: jest.fn().mockReturnValue('https://cdn/p.png'),
    generateMany: jest.fn().mockImplementation((arr: string[]) => arr.map((f) => `https://cdn/${f}`)),
} as any;

function makeBreeder(overrides: any = {}): any {
    return {
        _id: 'b-1',
        name: '브리더',
        petType: 'dog',
        breeds: ['푸들'],
        verification: { level: 'elite' },
        stats: { totalFavorites: 10, totalReviews: 5, averageRating: 4.5 },
        profile: {
            location: { city: '서울', district: '강남구' },
            representativePhotos: ['r1.png'],
            priceRange: { min: 100, max: 300 },
        },
        profileImageFileName: 'p.png',
        createdAt: new Date('2026-01-01'),
        ...overrides,
    };
}

describe('BreederExploreCardMapperService', () => {
    const service = new BreederExploreCardMapperService();

    describe('toExploreCard', () => {
        it('입양 가능 + 찜 플래그를 Set으로 판별한다', () => {
            const result = service.toExploreCard(makeBreeder(), fileUrlPort, new Set(['b-1']), new Set(['b-1']));
            expect(result.isAdoptionAvailable).toBe(true);
            expect(result.isFavorited).toBe(true);
        });

        it('Set에 없으면 false', () => {
            const result = service.toExploreCard(makeBreeder(), fileUrlPort, new Set(), new Set());
            expect(result.isAdoptionAvailable).toBe(false);
            expect(result.isFavorited).toBe(false);
        });

        it('priceRange min/max > 0 이면 range로 판별', () => {
            const result = service.toExploreCard(makeBreeder(), fileUrlPort, new Set(), new Set());
            expect(result.priceRange?.display).toBe('range');
        });

        it('priceRange가 없으면 not_set', () => {
            const breeder = makeBreeder({ profile: { location: { city: '서울', district: '강남구' } } });
            const result = service.toExploreCard(breeder, fileUrlPort, new Set(), new Set());
            expect(result.priceRange?.display).toBe('not_set');
        });

        it('priceRange.display가 있으면 그대로 사용', () => {
            const breeder = makeBreeder({ profile: { priceRange: { min: 0, max: 0, display: 'consultation' } } });
            const result = service.toExploreCard(breeder, fileUrlPort, new Set(), new Set());
            expect(result.priceRange?.display).toBe('consultation');
        });

        it('location이 없으면 빈 문자열', () => {
            const breeder = makeBreeder({ profile: {} });
            const result = service.toExploreCard(breeder, fileUrlPort, new Set(), new Set());
            expect(result.location).toBe('');
        });
    });

    describe('toPopularCard', () => {
        it('priceRange는 undefined, isFavorited는 항상 false', () => {
            const result = service.toPopularCard(makeBreeder(), fileUrlPort, new Set(['b-1']));
            expect(result.priceRange).toBeUndefined();
            expect(result.isFavorited).toBe(false);
            expect(result.isAdoptionAvailable).toBe(true);
        });
    });
});
