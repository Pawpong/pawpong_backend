import { BreederPublicProfileAssemblerService } from '../../../domain/services/breeder-public-profile-assembler.service';
import { BreederBirthDateFormatterService } from '../../../domain/services/breeder-birth-date-formatter.service';

const fileUrlPort = {
    generateOne: jest.fn().mockReturnValue('https://cdn/p.png'),
    generateOneSafe: jest.fn().mockReturnValue(''),
    generateMany: jest.fn().mockImplementation((arr: string[]) => arr.map((f) => `https://cdn/${f}`)),
} as any;

function makeBreeder(overrides: any = {}): any {
    return {
        _id: 'b-1',
        name: '브리더',
        emailAddress: 'b@example.com',
        petType: 'dog',
        breeds: ['푸들'],
        stats: { totalFavorites: 5, totalReviews: 2, averageRating: 4.5 },
        verification: { level: 'elite' },
        profile: {
            location: { city: '서울', district: '강남구' },
            representativePhotos: ['r.png'],
            priceRange: { min: 100, max: 300 },
            description: '설명',
        },
        profileImageFileName: 'p.png',
        createdAt: new Date('2026-01-01'),
        reviews: [
            ...Array.from({ length: 7 }, (_, i) => ({
                reviewId: `r-${i}`,
                writtenAt: new Date(),
                type: 'text',
                adopterName: 'x',
                rating: 5,
                content: 'c',
                isVisible: true,
            })),
        ],
        socialAuthInfo: { authProvider: 'google' },
        ...overrides,
    };
}

describe('BreederPublicProfileAssemblerService', () => {
    const service = new BreederPublicProfileAssemblerService(new BreederBirthDateFormatterService());

    it('기본 프로필 필드를 매핑한다', () => {
        const result = service.toResponse(makeBreeder(), true, [], [], fileUrlPort);
        expect(result.breederId).toBe('b-1');
        expect(result.authProvider).toBe('google');
        expect(result.location).toBe('서울 강남구');
        expect(result.priceRange.display).toBe('range');
    });

    it('리뷰는 visible만 뒤에서 5개', () => {
        const result = service.toResponse(makeBreeder(), false, [], [], fileUrlPort);
        expect(result.reviews).toHaveLength(5);
    });

    it('hidden 리뷰는 제외한다', () => {
        const breeder = makeBreeder({
            reviews: [
                {
                    reviewId: 'r1',
                    writtenAt: new Date(),
                    type: 't',
                    adopterName: 'x',
                    rating: 5,
                    content: 'c',
                    isVisible: false,
                },
                {
                    reviewId: 'r2',
                    writtenAt: new Date(),
                    type: 't',
                    adopterName: 'x',
                    rating: 5,
                    content: 'c',
                    isVisible: true,
                },
            ],
        });
        const result = service.toResponse(breeder, false, [], [], fileUrlPort);
        expect(result.reviews).toHaveLength(1);
    });

    it('location이 없으면 빈 문자열', () => {
        const breeder = makeBreeder({ profile: { priceRange: { min: 0, max: 0 } } });
        const result = service.toResponse(breeder, false, [], [], fileUrlPort);
        expect(result.location).toBe('');
        expect(result.priceRange.display).toBe('not_set');
    });

    it('authProvider가 없으면 local', () => {
        const breeder = makeBreeder({ socialAuthInfo: undefined });
        const result = service.toResponse(breeder, false, [], [], fileUrlPort);
        expect(result.authProvider).toBe('local');
    });
});
