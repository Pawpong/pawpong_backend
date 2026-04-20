import { ExploreBreedersUseCase } from '../../../application/use-cases/explore-breeders.use-case';
import { BreederExploreCriteriaService } from '../../../domain/services/breeder-explore-criteria.service';
import { BreederExploreFavoriteReaderService } from '../../../domain/services/breeder-explore-favorite-reader.service';
import { BreederExploreCardMapperService } from '../../../domain/services/breeder-explore-card-mapper.service';
import { BreederPaginationAssemblerService } from '../../../domain/services/breeder-pagination-assembler.service';

describe('브리더 탐색 유스케이스', () => {
    const breederPublicReaderPort = {
        findBreederIdsWithAvailablePets: jest.fn(),
        searchPublicBreeders: jest.fn(),
        findAdopterFavoriteBreederIds: jest.fn(),
        findBreederFavoriteBreederIds: jest.fn(),
    };
    const breederFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/img.jpg'),
        generateOneSafe: jest.fn().mockReturnValue(null),
        generateMany: jest.fn().mockReturnValue([]),
    };

    const useCase = new ExploreBreedersUseCase(
        breederPublicReaderPort as any,
        breederFileUrlPort as any,
        new BreederExploreCriteriaService(),
        new BreederExploreFavoriteReaderService(),
        new BreederExploreCardMapperService(),
        new BreederPaginationAssemblerService(),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        name: '행복브리더',
        petType: 'dog',
        breeds: ['말티즈'],
        verification: { status: 'approved', plan: 'basic', level: 'new' },
        profile: { location: { city: '서울', district: '강남구' }, representativePhotos: [], priceRange: null },
        stats: { averageRating: 4.5, totalReviews: 10, totalFavorites: 3 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederFileUrlPort.generateOne.mockReturnValue('https://cdn.example.com/img.jpg');
        breederFileUrlPort.generateOneSafe.mockReturnValue(null);
        breederFileUrlPort.generateMany.mockReturnValue([]);
    });

    it('비로그인 상태로 브리더 목록을 탐색한다', async () => {
        breederPublicReaderPort.findBreederIdsWithAvailablePets.mockResolvedValue(['breeder-1']);
        breederPublicReaderPort.searchPublicBreeders.mockResolvedValue({
            breeders: [mockBreeder],
            total: 1,
        });

        const result = await useCase.execute({ petType: 'dog', page: 1, limit: 20 } as any);

        expect(result.items).toHaveLength(1);
        expect(result.items[0].breederId).toBe('breeder-1');
        expect(result.items[0].isFavorited).toBe(false);
    });

    it('로그인 상태에서 즐겨찾기 정보를 포함해 반환한다', async () => {
        breederPublicReaderPort.findBreederIdsWithAvailablePets.mockResolvedValue(['breeder-1']);
        breederPublicReaderPort.searchPublicBreeders.mockResolvedValue({
            breeders: [mockBreeder],
            total: 1,
        });
        breederPublicReaderPort.findAdopterFavoriteBreederIds.mockResolvedValue(['breeder-1']);

        const result = await useCase.execute({ petType: 'dog', page: 1, limit: 20 } as any, 'adopter-1');

        expect(result.items[0].isFavorited).toBe(true);
        expect(breederPublicReaderPort.findAdopterFavoriteBreederIds).toHaveBeenCalledWith('adopter-1');
    });

    it('isAdoptionAvailable 필터가 true이면 분양 가능 브리더 ID로 filter를 적용한다', async () => {
        breederPublicReaderPort.findBreederIdsWithAvailablePets.mockResolvedValue(['breeder-1']);
        breederPublicReaderPort.searchPublicBreeders.mockResolvedValue({ breeders: [], total: 0 });
        breederPublicReaderPort.findAdopterFavoriteBreederIds.mockResolvedValue([]);

        await useCase.execute({ isAdoptionAvailable: true, page: 1, limit: 20 } as any);

        const callArgs = breederPublicReaderPort.searchPublicBreeders.mock.calls[0][0];
        expect(callArgs['_id']).toEqual({ $in: ['breeder-1'] });
    });
});
