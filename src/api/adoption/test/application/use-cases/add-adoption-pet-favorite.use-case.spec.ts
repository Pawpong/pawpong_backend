import { BadRequestException } from '@nestjs/common';

import { AddAdoptionPetFavoriteUseCase } from '../../../application/use-cases/add-adoption-pet-favorite.use-case';

describe('AddAdoptionPetFavoriteUseCase', () => {
    const petReader = {
        readActiveById: jest.fn(),
    };
    const favoriteWriter = { addAtomic: jest.fn() };

    const useCase = new AddAdoptionPetFavoriteUseCase(petReader as any, favoriteWriter as any);

    beforeEach(() => {
        jest.clearAllMocks();
        petReader.readActiveById.mockResolvedValue({ id: 'pet-1', favoriteCount: 5 });
    });

    it('동물이 없으면(비활성 포함) BadRequestException', async () => {
        // readActiveById 가 null 반환 — 미존재 또는 isActive=false (soft-deleted) 둘 다 동일 처리.
        petReader.readActiveById.mockResolvedValueOnce(null);
        await expect(useCase.execute('adopter-1', 'pet-x')).rejects.toThrow(BadRequestException);
        expect(favoriteWriter.addAtomic).not.toHaveBeenCalled();
    });

    it('soft-deleted(isActive=false) 펫은 readActiveById 가 null 반환 → 추가 거부', async () => {
        // 즐겨찾기 추가 가드: soft-deleted 펫에 stale 즐겨찾기/카운터가 쌓이지 않도록 readActiveById 사용.
        petReader.readActiveById.mockResolvedValueOnce(null);
        await expect(useCase.execute('adopter-1', 'pet-soft-deleted')).rejects.toThrow(
            '해당 동물을 찾을 수 없습니다.',
        );
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
