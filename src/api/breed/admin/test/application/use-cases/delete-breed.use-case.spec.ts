import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { DeleteBreedUseCase } from '../../../application/use-cases/delete-breed.use-case';

describe('품종 삭제 유스케이스', () => {
    const breedWriter = {
        delete: jest.fn(),
    };

    const useCase = new DeleteBreedUseCase(breedWriter as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('존재하는 품종을 정상 삭제한다', async () => {
        breedWriter.delete.mockResolvedValue(true);

        await expect(useCase.execute('breed-1')).resolves.toBeUndefined();
        expect(breedWriter.delete).toHaveBeenCalledWith('breed-1');
    });

    it('존재하지 않는 품종 삭제 시 DomainNotFoundError를 던진다', async () => {
        breedWriter.delete.mockResolvedValue(false);

        await expect(useCase.execute('nonexistent-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
            'ID nonexistent-id에 해당하는 품종 카테고리를 찾을 수 없습니다.',
        );
    });
});
