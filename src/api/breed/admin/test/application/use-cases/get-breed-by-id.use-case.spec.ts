import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { GetBreedByIdUseCase } from '../../../application/use-cases/get-breed-by-id.use-case';
import { BreedAdminResultMapperService } from '../../../../domain/services/breed-admin-result-mapper.service';

describe('품종 ID 조회 유스케이스 (관리자)', () => {
    const breedAdminReader = {
        findById: jest.fn(),
    };

    const useCase = new GetBreedByIdUseCase(
        breedAdminReader as any,
        new BreedAdminResultMapperService(),
    );

    const mockBreed = {
        id: 'breed-1',
        petType: 'dog',
        category: '소형견',
        categoryDescription: '10kg 미만',
        breeds: ['말티즈', '치와와'],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('존재하는 품종 ID로 조회하면 상세 정보를 반환한다', async () => {
        breedAdminReader.findById.mockResolvedValue(mockBreed);

        const result = await useCase.execute('breed-1');

        expect(result.id).toBe('breed-1');
        expect(result.petType).toBe('dog');
        expect(result.category).toBe('소형견');
        expect(result.breeds).toEqual(['말티즈', '치와와']);
        expect(breedAdminReader.findById).toHaveBeenCalledWith('breed-1');
    });

    it('존재하지 않는 ID 조회 시 DomainNotFoundError를 던진다', async () => {
        breedAdminReader.findById.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
            'ID nonexistent-id에 해당하는 품종 카테고리를 찾을 수 없습니다.',
        );
    });
});
