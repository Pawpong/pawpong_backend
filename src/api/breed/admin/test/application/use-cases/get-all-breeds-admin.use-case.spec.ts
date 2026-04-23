import { GetAllBreedsAdminUseCase } from '../../../application/use-cases/get-all-breeds-admin.use-case';
import { BreedAdminResultMapperService } from '../../../../domain/services/breed-admin-result-mapper.service';

describe('품종 전체 목록 조회 유스케이스 (관리자)', () => {
    const breedAdminReader = {
        readAll: jest.fn(),
    };

    const useCase = new GetAllBreedsAdminUseCase(breedAdminReader as any, new BreedAdminResultMapperService());

    const mockBreeds = [
        {
            id: 'breed-1',
            petType: 'dog',
            category: '소형견',
            categoryDescription: '10kg 미만',
            breeds: ['말티즈', '치와와'],
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        },
        {
            id: 'breed-2',
            petType: 'cat',
            category: '단모종',
            categoryDescription: '털이 짧은 고양이',
            breeds: ['아비시니안'],
            createdAt: new Date('2026-02-01'),
            updatedAt: new Date('2026-02-01'),
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('모든 품종 목록을 반환한다', async () => {
        breedAdminReader.readAll.mockResolvedValue(mockBreeds);

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('breed-1');
        expect(result[0].petType).toBe('dog');
        expect(result[1].id).toBe('breed-2');
    });

    it('품종이 없으면 빈 배열을 반환한다', async () => {
        breedAdminReader.readAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toHaveLength(0);
    });
});
