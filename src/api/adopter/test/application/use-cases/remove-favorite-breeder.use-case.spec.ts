import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { RemoveFavoriteBreederUseCase } from '../../../application/use-cases/remove-favorite-breeder.use-case';
import { AdopterFavoritePolicyService } from '../../../domain/services/adopter-favorite-policy.service';

describe('브리더 즐겨찾기 제거 유스케이스', () => {
    const adopterProfilePort = {
        findById: jest.fn(),
        removeFavoriteBreeder: jest.fn(),
    };

    const useCase = new RemoveFavoriteBreederUseCase(adopterProfilePort as any, new AdopterFavoritePolicyService());

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('즐겨찾기 목록에 있는 브리더를 정상 제거한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({
            favoriteBreederList: [{ favoriteBreederId: 'breeder-1' }],
        });
        adopterProfilePort.removeFavoriteBreeder.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', 'breeder-1');

        expect(result).toEqual({ message: '즐겨찾기에서 브리더를 제거했습니다.' });
        expect(adopterProfilePort.removeFavoriteBreeder).toHaveBeenCalledWith('user-1', 'breeder-1', undefined);
    });

    it('입양자 정보가 없으면 DomainNotFoundError를 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('user-1', 'breeder-1')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('user-1', 'breeder-1')).rejects.toThrow('입양자 정보를 찾을 수 없습니다.');
    });

    it('브리더 역할이면 에러 메시지가 브리더 기준으로 나온다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('user-1', 'breeder-1', 'breeder')).rejects.toThrow(
            '브리더 정보를 찾을 수 없습니다.',
        );
    });

    it('즐겨찾기 목록에 없는 브리더 제거 시 도메인 검증 예외를 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({
            favoriteBreederList: [{ favoriteBreederId: 'other-breeder' }],
        });

        await expect(useCase.execute('user-1', 'breeder-1')).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('user-1', 'breeder-1')).rejects.toThrow(
            '즐겨찾기 목록에서 해당 브리더를 찾을 수 없습니다.',
        );
    });

    it('favoriteBreederList가 없으면 빈 배열로 처리해 도메인 검증 예외를 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({
            favoriteBreederList: undefined,
        });

        await expect(useCase.execute('user-1', 'breeder-1')).rejects.toThrow(DomainValidationError);
    });

    it('브리더 역할로 즐겨찾기 목록에 있으면 정상 제거한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({
            favoriteBreederList: [{ favoriteBreederId: 'breeder-1' }],
        });
        adopterProfilePort.removeFavoriteBreeder.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', 'breeder-1', 'breeder');

        expect(result).toEqual({ message: '즐겨찾기에서 브리더를 제거했습니다.' });
        expect(adopterProfilePort.findById).toHaveBeenCalledWith('user-1', 'breeder');
        expect(adopterProfilePort.removeFavoriteBreeder).toHaveBeenCalledWith('user-1', 'breeder-1', 'breeder');
    });
});
