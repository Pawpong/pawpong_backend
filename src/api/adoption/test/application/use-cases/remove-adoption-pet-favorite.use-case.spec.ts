import { BadRequestException } from '@nestjs/common';

import { RemoveAdoptionPetFavoriteUseCase } from '../../../application/use-cases/remove-adoption-pet-favorite.use-case';

describe('RemoveAdoptionPetFavoriteUseCase', () => {
    const petReader = {
        readById: jest.fn(),
        incrementFavoriteCount: jest.fn(),
    };
    const favoriteWriter = { remove: jest.fn() };

    const useCase = new RemoveAdoptionPetFavoriteUseCase(petReader as any, favoriteWriter as any);

    beforeEach(() => {
        jest.clearAllMocks();
        petReader.readById.mockResolvedValue({ id: 'pet-1', favoriteCount: 5 });
    });

    it('동물이 없으면 BadRequestException', async () => {
        petReader.readById.mockResolvedValueOnce(null);
        await expect(useCase.execute('adopter-1', 'pet-x')).rejects.toThrow(BadRequestException);
        expect(favoriteWriter.remove).not.toHaveBeenCalled();
    });

    it('해제 성공 시 favoriteCount 가 -1 감소', async () => {
        favoriteWriter.remove.mockResolvedValueOnce(true);
        petReader.readById.mockResolvedValueOnce({ id: 'pet-1', favoriteCount: 5 });
        petReader.readById.mockResolvedValueOnce({ id: 'pet-1', favoriteCount: 4 });

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(petReader.incrementFavoriteCount).toHaveBeenCalledWith('pet-1', -1);
        expect(result).toEqual({ removed: true, favoriteCount: 4 });
    });

    it('해제 후 favoriteCount 가 음수가 되어도 0 미만으로 떨어지지 않는다', async () => {
        favoriteWriter.remove.mockResolvedValueOnce(true);
        petReader.readById.mockResolvedValueOnce({ id: 'pet-1', favoriteCount: 0 });
        petReader.readById.mockResolvedValueOnce({ id: 'pet-1', favoriteCount: -1 });

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(result.favoriteCount).toBe(0);
    });

    it('등록되지 않은 즐겨찾기 해제는 idempotent — removed=false, increment 호출 안 함', async () => {
        favoriteWriter.remove.mockResolvedValueOnce(false);

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(petReader.incrementFavoriteCount).not.toHaveBeenCalled();
        expect(result.removed).toBe(false);
    });
});
