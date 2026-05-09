import { BadRequestException } from '@nestjs/common';

import { AddAdoptionPetFavoriteUseCase } from '../../../application/use-cases/add-adoption-pet-favorite.use-case';

describe('AddAdoptionPetFavoriteUseCase', () => {
    const petReader = {
        readById: jest.fn(),
    };
    const favoriteWriter = { addAtomic: jest.fn() };

    const useCase = new AddAdoptionPetFavoriteUseCase(petReader as any, favoriteWriter as any);

    beforeEach(() => {
        jest.clearAllMocks();
        petReader.readById.mockResolvedValue({ id: 'pet-1', favoriteCount: 5 });
    });

    it('동물이 없으면 BadRequestException', async () => {
        petReader.readById.mockResolvedValueOnce(null);
        await expect(useCase.execute('adopter-1', 'pet-x')).rejects.toThrow(BadRequestException);
        expect(favoriteWriter.addAtomic).not.toHaveBeenCalled();
    });

    it('새로 추가되면 added=true 와 트랜잭션 결과 favoriteCount 가 그대로 반영된다', async () => {
        favoriteWriter.addAtomic.mockResolvedValueOnce({ changed: true, favoriteCount: 6 });

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(favoriteWriter.addAtomic).toHaveBeenCalledWith('adopter-1', 'pet-1');
        expect(result).toEqual({ added: true, favoriteCount: 6 });
    });

    it('이미 등록된 즐겨찾기는 idempotent — added=false, 카운터 트랜잭션 결과 그대로', async () => {
        favoriteWriter.addAtomic.mockResolvedValueOnce({ changed: false, favoriteCount: 5 });

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(result).toEqual({ added: false, favoriteCount: 5 });
    });
});
