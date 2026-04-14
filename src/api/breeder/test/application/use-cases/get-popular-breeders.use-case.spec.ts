import { GetPopularBreedersUseCase } from '../../../application/use-cases/get-popular-breeders.use-case';
import { BreederExploreCardMapperService } from '../../../domain/services/breeder-explore-card-mapper.service';

describe('인기 브리더 목록 유스케이스', () => {
    const breederPublicReaderPort = {
        findPopularPublicBreeders: jest.fn(),
        findBreederIdsWithAvailablePets: jest.fn(),
    };
    const breederFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/img.jpg'),
        generateOneSafe: jest.fn().mockReturnValue(null),
        generateMany: jest.fn().mockReturnValue([]),
    };

    const useCase = new GetPopularBreedersUseCase(
        breederPublicReaderPort as any,
        breederFileUrlPort as any,
        new BreederExploreCardMapperService(),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        name: '인기브리더',
        petType: 'dog',
        breeds: ['골든 리트리버'],
        verification: { status: 'approved', plan: 'basic', level: 'elite' },
        profile: { location: { city: '서울', district: '서초구' }, representativePhotos: [], priceRange: null },
        stats: { averageRating: 4.9, totalReviews: 50, totalFavorites: 100 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederFileUrlPort.generateOne.mockReturnValue('https://cdn.example.com/img.jpg');
        breederFileUrlPort.generateOneSafe.mockReturnValue(null);
        breederFileUrlPort.generateMany.mockReturnValue([]);
    });

    it('인기 브리더 목록을 반환한다', async () => {
        breederPublicReaderPort.findPopularPublicBreeders.mockResolvedValue([mockBreeder]);
        breederPublicReaderPort.findBreederIdsWithAvailablePets.mockResolvedValue(['breeder-1']);

        const result = await useCase.execute(10);

        expect(result).toHaveLength(1);
        expect(result[0].breederId).toBe('breeder-1');
        expect(result[0].isAdoptionAvailable).toBe(true);
        expect(breederPublicReaderPort.findPopularPublicBreeders).toHaveBeenCalledWith(10);
    });

    it('분양 가능하지 않은 브리더는 isAdoptionAvailable이 false이다', async () => {
        breederPublicReaderPort.findPopularPublicBreeders.mockResolvedValue([mockBreeder]);
        breederPublicReaderPort.findBreederIdsWithAvailablePets.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result[0].isAdoptionAvailable).toBe(false);
    });

    it('인기 브리더가 없으면 빈 배열을 반환한다', async () => {
        breederPublicReaderPort.findPopularPublicBreeders.mockResolvedValue([]);
        breederPublicReaderPort.findBreederIdsWithAvailablePets.mockResolvedValue([]);

        const result = await useCase.execute(10);

        expect(result).toHaveLength(0);
    });
});
