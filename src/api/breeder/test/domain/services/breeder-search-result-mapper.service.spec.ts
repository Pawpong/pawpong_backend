import { BreederSearchResultMapperService } from '../../../domain/services/breeder-search-result-mapper.service';

const fileUrlPort = {
    generateOne: jest.fn().mockReturnValue('https://cdn/profile.png'),
    generateOneSafe: jest.fn(),
    generateMany: jest.fn().mockImplementation((arr: string[]) => arr.map((f) => `https://cdn/${f}`)),
} as any;

describe('BreederSearchResultMapperService', () => {
    const service = new BreederSearchResultMapperService();

    beforeEach(() => {
        fileUrlPort.generateOne.mockClear();
        fileUrlPort.generateMany.mockClear();
    });

    it('검색 결과 아이템으로 매핑한다', () => {
        const breeder = {
            _id: 'b-1',
            name: '브리더A',
            profileImageFileName: 'p.png',
            profile: {
                location: { city: '서울' },
                specialization: ['dog'],
                representativePhotos: ['r1.png'],
            },
            stats: { averageRating: 4.5, totalReviews: 20 },
            verification: { status: 'approved' },
            availablePets: [{}, {}],
        } as any;
        const result = service.toItem(breeder, fileUrlPort);
        expect(result.breederId).toBe('b-1');
        expect(result.profileImage).toBe('https://cdn/profile.png');
        expect(result.profilePhotos).toEqual(['https://cdn/r1.png']);
        expect(result.verificationStatus).toBe('approved');
        expect(result.availablePets).toBe(2);
    });

    it('location이 없으면 Unknown, rating/reviews 기본 0', () => {
        const result = service.toItem({ _id: 'b-2', name: '브리더' } as any, fileUrlPort);
        expect(result.location).toBe('Unknown');
        expect(result.averageRating).toBe(0);
        expect(result.totalReviews).toBe(0);
        expect(result.verificationStatus).toBe('pending');
        expect(result.availablePets).toBe(0);
    });

    it('profileImageFileName이 없으면 profileImage는 undefined', () => {
        const result = service.toItem({ _id: 'b-3', name: '브리더' } as any, fileUrlPort);
        expect(result.profileImage).toBeUndefined();
    });
});
