import { DomainConflictError } from '../../../../../common/error/domain.error';
import { AddFavoriteBreederUseCase } from '../../../application/use-cases/add-favorite-breeder.use-case';
import { AdopterFavoritePolicyService } from '../../../domain/services/adopter-favorite-policy.service';
import { AdopterFavoriteRecordMapperService } from '../../../domain/services/adopter-favorite-record-mapper.service';

describe('브리더 즐겨찾기 추가 유스케이스', () => {
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

    const useCase = new AddFavoriteBreederUseCase(
        adopterProfilePort as any,
        breederReaderPort as any,
        new AdopterFavoritePolicyService(),
        new AdopterFavoriteRecordMapperService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('브리더 역할이면 역할 정보를 유지한 채 즐겨찾기를 추가한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({
            favoriteBreederList: [],
        });
        breederReaderPort.findById.mockResolvedValue({
            _id: { toString: () => 'breeder-1' },
            name: '행복브리더',
            nickname: '행복브리더',
            stats: {},
            profile: {},
        });

        await expect(
            useCase.execute('user-1', { breederId: 'breeder-1' }, 'breeder'),
        ).resolves.toEqual({ message: '브리더를 즐겨찾기에 추가했습니다.' });

        expect(adopterProfilePort.findById).toHaveBeenCalledWith('user-1', 'breeder');
        expect(adopterProfilePort.addFavoriteBreeder).toHaveBeenCalledWith(
            'user-1',
            expect.objectContaining({ favoriteBreederId: 'breeder-1' }),
            'breeder',
        );
    });

    it('이미 즐겨찾기된 브리더면 도메인 충돌 예외를 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({
            favoriteBreederList: [{ favoriteBreederId: 'breeder-1' }],
        });
        breederReaderPort.findById.mockResolvedValue({
            _id: { toString: () => 'breeder-1' },
            name: '행복브리더',
            nickname: '행복브리더',
            stats: {},
            profile: {},
        });

        await expect(useCase.execute('user-1', { breederId: 'breeder-1' })).rejects.toThrow(DomainConflictError);
        await expect(useCase.execute('user-1', { breederId: 'breeder-1' })).rejects.toThrow(
            '이미 즐겨찾기에 추가된 브리더입니다.',
        );
    });
});
