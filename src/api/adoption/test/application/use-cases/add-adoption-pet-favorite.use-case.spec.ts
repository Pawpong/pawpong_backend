import { BadRequestException } from '@nestjs/common';

import { AddAdoptionPetFavoriteUseCase } from '../../../application/use-cases/add-adoption-pet-favorite.use-case';

describe('AddAdoptionPetFavoriteUseCase', () => {
    const petReader = {
        readById: jest.fn(),
        incrementFavoriteCount: jest.fn(),
    };
    const favoriteWriter = { add: jest.fn() };

    const useCase = new AddAdoptionPetFavoriteUseCase(petReader as any, favoriteWriter as any);

    const basePet = {
        id: 'pet-1',
        favoriteCount: 5,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        petReader.readById.mockResolvedValue(basePet);
    });

    it('동물이 없으면 BadRequestException', async () => {
        petReader.readById.mockResolvedValueOnce(null);
        await expect(useCase.execute('adopter-1', 'pet-x')).rejects.toThrow(BadRequestException);
        expect(favoriteWriter.add).not.toHaveBeenCalled();
    });

    it('새로 추가되면 favoriteCount 가 +1 증가하고 added=true', async () => {
        favoriteWriter.add.mockResolvedValueOnce(true);
        petReader.readById.mockResolvedValueOnce(basePet); // initial check
        petReader.readById.mockResolvedValueOnce({ ...basePet, favoriteCount: 6 }); // refreshed

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(petReader.incrementFavoriteCount).toHaveBeenCalledWith('pet-1', 1);
        expect(result).toEqual({ added: true, favoriteCount: 6 });
    });

    it('이미 등록된 즐겨찾기는 idempotent — added=false, increment 호출 안 함', async () => {
        favoriteWriter.add.mockResolvedValueOnce(false);

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(petReader.incrementFavoriteCount).not.toHaveBeenCalled();
        expect(result.added).toBe(false);
    });
});
