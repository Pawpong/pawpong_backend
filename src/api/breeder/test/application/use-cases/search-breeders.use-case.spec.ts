import { SearchBreedersUseCase } from '../../../application/use-cases/search-breeders.use-case';
import { BreederSearchCriteriaService } from '../../../domain/services/breeder-search-criteria.service';
import { BreederSearchResultMapperService } from '../../../domain/services/breeder-search-result-mapper.service';
import { BreederPaginationAssemblerService } from '../../../domain/services/breeder-pagination-assembler.service';

describe('브리더 검색 유스케이스', () => {
    const breederPublicReaderPort = {
        searchPublicBreeders: jest.fn(),
    };
    const breederFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/img.jpg'),
        generateOneSafe: jest.fn().mockReturnValue(null),
        generateMany: jest.fn().mockReturnValue([]),
    };

    const useCase = new SearchBreedersUseCase(
        breederPublicReaderPort as any,
        breederFileUrlPort as any,
        new BreederSearchCriteriaService(),
        new BreederSearchResultMapperService(),
        new BreederPaginationAssemblerService(),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        name: '행복브리더',
        nickname: '행복브리더',
        accountStatus: 'active',
        verification: { status: 'approved', plan: 'basic', level: 'new' },
        profile: {
            location: { city: '서울', district: '강남구' },
            specialization: ['dog'],
            representativePhotos: [],
            priceRange: null,
        },
        stats: { averageRating: 4.5, totalReviews: 10, completedAdoptions: 5 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederFileUrlPort.generateOne.mockReturnValue('https://cdn.example.com/img.jpg');
        breederFileUrlPort.generateOneSafe.mockReturnValue(null);
        breederFileUrlPort.generateMany.mockReturnValue([]);
    });

    it('검색 조건 없이 기본 목록을 반환한다', async () => {
        breederPublicReaderPort.searchPublicBreeders.mockResolvedValue({
            breeders: [mockBreeder],
            total: 1,
        });

        const result = await useCase.execute({} as any);

        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
        expect(breederPublicReaderPort.searchPublicBreeders).toHaveBeenCalled();
    });

    it('검색 결과가 없으면 빈 배열을 반환한다', async () => {
        breederPublicReaderPort.searchPublicBreeders.mockResolvedValue({ breeders: [], total: 0 });

        const result = await useCase.execute({ petType: 'cat' } as any);

        expect(result.items).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
    });
});
