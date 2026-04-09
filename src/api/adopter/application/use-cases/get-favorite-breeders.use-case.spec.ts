import { GetFavoriteBreedersUseCase } from './get-favorite-breeders.use-case';
import { AdopterPaginationAssemblerService } from '../../domain/services/adopter-pagination-assembler.service';

describe('브리더 즐겨찾기 목록 조회 유스케이스', () => {
    const adopterProfilePort = {
        findById: jest.fn(),
        updateProfile: jest.fn(),
        findFavoriteList: jest.fn(),
        addFavoriteBreeder: jest.fn(),
        removeFavoriteBreeder: jest.fn(),
    };
    const breederReaderPort = {
        findById: jest.fn(),
    };
    const fileUrlPort = {
        generateOneSafe: jest.fn(),
        generateMany: jest.fn(),
    };

    const useCase = new GetFavoriteBreedersUseCase(
        adopterProfilePort as any,
        breederReaderPort as any,
        fileUrlPort as any,
        new AdopterPaginationAssemblerService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('브리더 역할이면 브리더 즐겨찾기 목록을 그대로 조회한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({
            favoriteBreederList: [{ favoriteBreederId: 'breeder-1', breederName: '행복브리더', addedAt: new Date() }],
        });
        adopterProfilePort.findFavoriteList.mockResolvedValue({
            favorites: [{ favoriteBreederId: 'breeder-1', breederName: '행복브리더', addedAt: new Date() }],
            total: 1,
        });
        breederReaderPort.findById.mockResolvedValue({
            _id: { toString: () => 'breeder-1' },
            name: '행복브리더',
            nickname: '행복브리더',
            stats: { averageRating: 4.9, totalReviews: 12, totalFavorites: 5 },
            profile: { location: { city: '서울', district: '강남구' }, representativePhotos: ['photo.jpg'] },
            verification: { level: 'elite' },
            petType: 'dog',
            profileImageFileName: 'profile.jpg',
        });
        fileUrlPort.generateOneSafe.mockReturnValue('signed-profile');
        fileUrlPort.generateMany.mockReturnValue(['signed-photo']);

        const result = await useCase.execute('user-1', 1, 10, 'breeder');

        expect(adopterProfilePort.findById).toHaveBeenCalledWith('user-1', 'breeder');
        expect(adopterProfilePort.findFavoriteList).toHaveBeenCalledWith('user-1', 1, 10, 'breeder');
        expect(result).toMatchObject({
            items: [{ breederId: 'breeder-1', breederName: '행복브리더' }],
            pagination: { totalItems: 1, currentPage: 1 },
        });
    });
});
