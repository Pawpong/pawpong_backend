import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { AddAdoptionPetFavoriteUseCase } from '../../../application/use-cases/add-adoption-pet-favorite.use-case';
import type { AdopterPetFavoriteWriterPort } from '../../../application/ports/adopter-pet-favorite.port';
import type { AdoptionPetReaderPort } from '../../../application/ports/adoption-pet-reader.port';

describe('AddAdoptionPetFavoriteUseCase', () => {
    const petReader = {
        readActiveById: jest.fn(),
    };
    const favoriteWriter = { addAtomic: jest.fn() };

    const useCase = new AddAdoptionPetFavoriteUseCase(
        petReader as unknown as AdoptionPetReaderPort,
        favoriteWriter as unknown as AdopterPetFavoriteWriterPort,
    );

    beforeEach(() => {
        jest.clearAllMocks();
        petReader.readActiveById.mockResolvedValue({
            id: 'pet-1',
            breederId: 'breeder-owner',
            favoriteCount: 5,
        });
    });

    it('동물이 없으면(비활성 포함) BadRequestException', async () => {
        // readActiveById 가 null 반환 — 미존재 또는 isActive=false (soft-deleted) 둘 다 동일 처리.
        petReader.readActiveById.mockResolvedValueOnce(null);
        await expect(useCase.execute('adopter-1', 'pet-x', 'adopter')).rejects.toThrow(BadRequestException);
        expect(favoriteWriter.addAtomic).not.toHaveBeenCalled();
    });

    it('soft-deleted(isActive=false) 펫은 readActiveById 가 null 반환 → 추가 거부', async () => {
        // 즐겨찾기 추가 가드: soft-deleted 펫에 stale 즐겨찾기/카운터가 쌓이지 않도록 readActiveById 사용.
        petReader.readActiveById.mockResolvedValueOnce(null);
        await expect(useCase.execute('adopter-1', 'pet-soft-deleted', 'adopter')).rejects.toThrow(
            '해당 동물을 찾을 수 없습니다.',
        );
        expect(favoriteWriter.addAtomic).not.toHaveBeenCalled();
    });

    it('브리더가 본인 분양 동물에 관심을 등록하면 ForbiddenException', async () => {
        await expect(useCase.execute('breeder-owner', 'pet-1', 'breeder')).rejects.toThrow(ForbiddenException);
        expect(favoriteWriter.addAtomic).not.toHaveBeenCalled();
    });

    it('브리더가 다른 브리더의 분양 동물에 관심을 등록할 수 있다', async () => {
        favoriteWriter.addAtomic.mockResolvedValueOnce({ changed: true, favoriteCount: 6 });

        await expect(useCase.execute('breeder-viewer', 'pet-1', 'breeder')).resolves.toEqual({
            added: true,
            favoriteCount: 6,
        });
        expect(favoriteWriter.addAtomic).toHaveBeenCalledWith('breeder-viewer', 'pet-1');
    });

    it('새로 추가되면 added=true 와 트랜잭션 결과 favoriteCount 가 그대로 반영된다', async () => {
        favoriteWriter.addAtomic.mockResolvedValueOnce({ changed: true, favoriteCount: 6 });

        const result = await useCase.execute('adopter-1', 'pet-1', 'adopter');

        expect(favoriteWriter.addAtomic).toHaveBeenCalledWith('adopter-1', 'pet-1');
        expect(result).toEqual({ added: true, favoriteCount: 6 });
    });

    it('이미 등록된 즐겨찾기는 idempotent — added=false, 카운터 트랜잭션 결과 그대로', async () => {
        favoriteWriter.addAtomic.mockResolvedValueOnce({ changed: false, favoriteCount: 5 });

        const result = await useCase.execute('adopter-1', 'pet-1', 'adopter');

        expect(result).toEqual({ added: false, favoriteCount: 5 });
    });
});
