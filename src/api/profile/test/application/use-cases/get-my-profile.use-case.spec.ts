import { BadRequestException } from '@nestjs/common';

import { GetMyProfileUseCase } from '../../../application/use-cases/get-my-profile.use-case';
import { ProfileMapperService } from '../../../domain/services/profile-mapper.service';

const assetUrl = { toProfileImageUrl: (n?: string | null) => (n ? `https://signed/${n}` : undefined) };

describe('GetMyProfileUseCase', () => {
    const reader = {
        readAdopter: jest.fn(),
        readBreeder: jest.fn(),
        listFavoriteBreeders: jest.fn(),
        isFavoritedBy: jest.fn(),
    };
    const mapper = new ProfileMapperService(assetUrl as any);

    const useCase = new GetMyProfileUseCase(reader as any, mapper);

    beforeEach(() => jest.clearAllMocks());

    it('adopter role 이면 readAdopter 결과를 매핑한다', async () => {
        reader.readAdopter.mockResolvedValueOnce({
            userId: 'a-1',
            nickname: '닉',
            profileImageFileName: 'pf.jpg',
            bio: '안녕',
            bpm: 60,
            followerCount: 100,
            favoriteBreederCount: 3,
        });

        const result = await useCase.execute('a-1', 'adopter');

        expect(result.role).toBe('adopter');
        expect(result.userId).toBe('a-1');
        expect(result.profileImageUrl).toBe('https://signed/pf.jpg');
        expect(result.favoriteBreederCount).toBe(3);
        expect(result.level).toBeUndefined();
    });

    it('breeder role 이면 readBreeder 결과를 매핑한다', async () => {
        reader.readBreeder.mockResolvedValueOnce({
            breederId: 'b-1',
            nickname: '브리더닉',
            profileImageFileName: undefined,
            bio: '브리더 소개',
            longDescription: '긴 소개',
            bpm: 80,
            followerCount: 1600,
            level: 'elite',
            plan: 'pro',
            businessLocation: { city: '경상남도', district: '창원시' },
        });

        const result = await useCase.execute('b-1', 'breeder');

        expect(result.role).toBe('breeder');
        expect(result.level).toBe('elite');
        expect(result.plan).toBe('pro');
        expect(result.businessLocation?.city).toBe('경상남도');
        expect(result.profileImageUrl).toBeUndefined();
    });

    it('데이터 없음이면 BadRequest', async () => {
        reader.readAdopter.mockResolvedValueOnce(null);
        await expect(useCase.execute('x', 'adopter')).rejects.toThrow(BadRequestException);

        reader.readBreeder.mockResolvedValueOnce(null);
        await expect(useCase.execute('y', 'breeder')).rejects.toThrow(BadRequestException);
    });
});
