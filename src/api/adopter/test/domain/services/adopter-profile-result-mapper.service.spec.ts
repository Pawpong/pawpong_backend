import { AdopterProfileResultMapperService } from '../../../domain/services/adopter-profile-result-mapper.service';

describe('AdopterProfileResultMapperService', () => {
    const service = new AdopterProfileResultMapperService();

    function makeAdopter(overrides: any = {}): any {
        return {
            _id: { toString: () => 'adopter-1' },
            emailAddress: 'a@b.com',
            nickname: '닉',
            phoneNumber: '010-0',
            profileImageFileName: 'img.png',
            accountStatus: 'active',
            socialAuthInfo: { authProvider: 'google' },
            marketingAgreed: true,
            favoriteBreederList: [
                { favoriteBreederId: 'b-1', breederName: '브리더', addedAt: new Date(), breederProfileImageUrl: 'p', breederLocation: 'loc' },
            ],
            adoptionApplicationList: [
                { applicationId: 'app-1', targetBreederId: 'b-1', targetPetId: 'p-1', applicationStatus: 'pending', appliedAt: new Date() },
            ],
            writtenReviewList: [
                { reviewId: 'r-1', targetBreederId: 'b-1', overallRating: 5, reviewContent: '좋음', createdAt: new Date() },
            ],
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-02'),
            ...overrides,
        };
    }

    it('전체 프로필을 매핑한다', () => {
        const result = service.toResult(makeAdopter());
        expect(result.adopterId).toBe('adopter-1');
        expect(result.authProvider).toBe('google');
        expect(result.favoriteBreederList).toHaveLength(1);
        expect(result.adoptionApplicationList[0].breederId).toBe('b-1');
        expect(result.writtenReviewList[0].rating).toBe(5);
    });

    it('authProvider가 없으면 local을 사용한다', () => {
        const result = service.toResult(makeAdopter({ socialAuthInfo: undefined }));
        expect(result.authProvider).toBe('local');
    });

    it('marketingAgreed가 없으면 false', () => {
        const result = service.toResult(makeAdopter({ marketingAgreed: undefined }));
        expect(result.marketingAgreed).toBe(false);
    });

    it('리스트가 없으면 빈 배열을 반환한다', () => {
        const result = service.toResult(
            makeAdopter({ favoriteBreederList: undefined, adoptionApplicationList: undefined, writtenReviewList: undefined }),
        );
        expect(result.favoriteBreederList).toEqual([]);
        expect(result.adoptionApplicationList).toEqual([]);
        expect(result.writtenReviewList).toEqual([]);
    });
});
