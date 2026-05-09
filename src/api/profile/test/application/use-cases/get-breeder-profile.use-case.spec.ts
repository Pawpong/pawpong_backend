import { BadRequestException } from '@nestjs/common';

import { GetBreederProfileUseCase } from '../../../application/use-cases/get-breeder-profile.use-case';
import { ProfileMapperService } from '../../../domain/services/profile-mapper.service';

const assetUrl = { toProfileImageUrl: () => undefined };

const breederSnapshot = {
    breederId: 'b-1',
    nickname: '브리더',
    bio: '소개',
    longDescription: '긴 소개',
    bpm: 60,
    followerCount: 1600,
    level: 'elite' as const,
    plan: 'pro' as const,
    businessLocation: { city: '경상남도', district: '창원시' },
};

describe('GetBreederProfileUseCase', () => {
    const reader = { readBreeder: jest.fn(), readAdopter: jest.fn(), listFavoriteBreeders: jest.fn(), isFavoritedBy: jest.fn() };
    const mapper = new ProfileMapperService(assetUrl as any);
    const useCase = new GetBreederProfileUseCase(reader as any, mapper);

    beforeEach(() => {
        jest.clearAllMocks();
        reader.readBreeder.mockResolvedValue(breederSnapshot);
    });

    it('브리더 없음이면 BadRequest', async () => {
        reader.readBreeder.mockResolvedValueOnce(null);
        await expect(useCase.execute('x')).rejects.toThrow(BadRequestException);
        expect(reader.isFavoritedBy).not.toHaveBeenCalled();
    });

    it('비로그인 호출 — isFavorited=false, isFavoritedBy 호출 안 함', async () => {
        const result = await useCase.execute('b-1');
        expect(result.isFavorited).toBe(false);
        expect(reader.isFavoritedBy).not.toHaveBeenCalled();
    });

    it('로그인 브리더가 보면 isFavorited=false (입양자만 즐겨찾기 가능)', async () => {
        const result = await useCase.execute('b-1', 'viewer-1', 'breeder');
        expect(result.isFavorited).toBe(false);
        expect(reader.isFavoritedBy).not.toHaveBeenCalled();
    });

    it('로그인 입양자라면 isFavoritedBy 결과를 isFavorited 에 채운다', async () => {
        reader.isFavoritedBy.mockResolvedValueOnce(true);
        const result = await useCase.execute('b-1', 'adopter-1', 'adopter');
        expect(reader.isFavoritedBy).toHaveBeenCalledWith('adopter-1', 'b-1');
        expect(result.isFavorited).toBe(true);
    });
});
