import { BadRequestException } from '@nestjs/common';

import { RemoveAdoptionPetFavoriteUseCase } from '../../../application/use-cases/remove-adoption-pet-favorite.use-case';

describe('RemoveAdoptionPetFavoriteUseCase', () => {
    const petReader = {
        readById: jest.fn(),
    };
    const favoriteWriter = { removeAtomic: jest.fn() };

    const useCase = new RemoveAdoptionPetFavoriteUseCase(petReader as any, favoriteWriter as any);

    beforeEach(() => {
        jest.clearAllMocks();
        petReader.readById.mockResolvedValue({ id: 'pet-1', favoriteCount: 5 });
    });

    it('동물이 없으면 BadRequestException', async () => {
        petReader.readById.mockResolvedValueOnce(null);
        await expect(useCase.execute('adopter-1', 'pet-x')).rejects.toThrow(BadRequestException);
        expect(favoriteWriter.removeAtomic).not.toHaveBeenCalled();
    });

    it('해제 성공 시 removed=true 와 트랜잭션 결과 favoriteCount 가 그대로 반영된다', async () => {
        favoriteWriter.removeAtomic.mockResolvedValueOnce({ changed: true, favoriteCount: 4 });

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(favoriteWriter.removeAtomic).toHaveBeenCalledWith('adopter-1', 'pet-1');
        expect(result).toEqual({ removed: true, favoriteCount: 4 });
    });

    it('등록되지 않은 즐겨찾기 해제는 idempotent — removed=false, 카운터 그대로', async () => {
        favoriteWriter.removeAtomic.mockResolvedValueOnce({ changed: false, favoriteCount: 5 });

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(result).toEqual({ removed: false, favoriteCount: 5 });
    });

    it('어댑터가 음수 방지를 적용한 결과(0) 가 그대로 응답으로 전달된다', async () => {
        favoriteWriter.removeAtomic.mockResolvedValueOnce({ changed: true, favoriteCount: 0 });

        const result = await useCase.execute('adopter-1', 'pet-1');

        expect(result.favoriteCount).toBe(0);
    });
});
