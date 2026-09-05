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
    followingCount: 0,
    plan: 'pro' as const,
    businessLocation: { city: '경상남도', district: '창원시' },
};

describe('GetBreederProfileUseCase', () => {
    const reader = {
        readBreeder: jest.fn(),
        readAdopter: jest.fn(),
        listFavoriteBreeders: jest.fn(),
        isFavoritedBy: jest.fn(),
    };
    const follow = {
        follow: jest.fn(),
        unfollow: jest.fn(),
        isFollowing: jest.fn(),
        listFollowers: jest.fn(),
        listFollowings: jest.fn(),
        removeFollower: jest.fn(),
    };
    const mapper = new ProfileMapperService(assetUrl);
    const useCase = new GetBreederProfileUseCase(reader, follow, mapper);

    beforeEach(() => {
        jest.clearAllMocks();
        reader.readBreeder.mockResolvedValue(breederSnapshot);
        follow.isFollowing.mockResolvedValue(false);
    });

    it('브리더 없음이면 BadRequest', async () => {
        reader.readBreeder.mockResolvedValueOnce(null);
        await expect(useCase.execute('x')).rejects.toThrow(BadRequestException);
        expect(reader.isFavoritedBy).not.toHaveBeenCalled();
    });

    it('비로그인 호출 — isFavorited/isFollowing=false, 조회 자체를 하지 않음', async () => {
        const result = await useCase.execute('b-1');
        expect(result.isFavorited).toBe(false);
        expect(result.isFollowing).toBe(false);
        expect(result).not.toHaveProperty('level');
        expect(reader.isFavoritedBy).not.toHaveBeenCalled();
        expect(follow.isFollowing).not.toHaveBeenCalled();
    });

    it('로그인 브리더가 보면 isFavorited=false (입양자만 즐겨찾기 가능)', async () => {
        const result = await useCase.execute('b-1', 'viewer-1', 'breeder');
        expect(result.isFavorited).toBe(false);
        expect(reader.isFavoritedBy).not.toHaveBeenCalled();
    });

    it('로그인 사용자면 역할과 무관하게 isFollowing 을 채운다', async () => {
        follow.isFollowing.mockResolvedValueOnce(true);
        const result = await useCase.execute('b-1', 'viewer-1', 'breeder');
        expect(follow.isFollowing).toHaveBeenCalledWith('viewer-1', 'b-1');
        expect(result.isFollowing).toBe(true);
    });

    it('브리더가 자기 홈을 보면 isFollowing=false (조회 생략)', async () => {
        const result = await useCase.execute('b-1', 'b-1', 'breeder');
        expect(result.isFollowing).toBe(false);
        expect(follow.isFollowing).not.toHaveBeenCalled();
    });

    it('로그인 입양자라면 isFavoritedBy 결과를 isFavorited 에 채운다', async () => {
        reader.isFavoritedBy.mockResolvedValueOnce(true);
        const result = await useCase.execute('b-1', 'adopter-1', 'adopter');
        expect(reader.isFavoritedBy).toHaveBeenCalledWith('adopter-1', 'b-1');
        expect(result.isFavorited).toBe(true);
    });
});
