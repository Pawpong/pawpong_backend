import { BadRequestException } from '@nestjs/common';

import type { ProfileAssetUrlPort } from '../../../application/ports/profile-asset-url.port';
import type { ProfileFollowPort } from '../../../application/ports/profile-follow.port';
import type { ProfileReaderPort } from '../../../application/ports/profile-reader.port';
import { GetAdopterProfileUseCase } from '../../../application/use-cases/get-adopter-profile.use-case';
import { ProfileMapperService } from '../../../domain/services/profile-mapper.service';

const assetUrl: ProfileAssetUrlPort = {
    toProfileImageUrl: (name?: string | null) => (name ? `https://signed/${name}` : undefined),
};

const adopterSnapshot = {
    userId: 'adopter-1',
    nickname: '입양자',
    profileImageFileName: 'profile.jpg',
    bio: '소개',
    bpm: 60,
    followerCount: 12,
    followingCount: 5,
    favoriteBreederCount: 3,
};

describe('GetAdopterProfileUseCase', () => {
    const isFollowing = jest.fn<
        ReturnType<ProfileFollowPort['isFollowing']>,
        Parameters<ProfileFollowPort['isFollowing']>
    >();
    const reader: jest.Mocked<ProfileReaderPort> = {
        readAdopter: jest.fn(),
        readBreeder: jest.fn(),
        listFavoriteBreeders: jest.fn(),
        isFavoritedBy: jest.fn(),
    };
    const follow: jest.Mocked<ProfileFollowPort> = {
        follow: jest.fn(),
        unfollow: jest.fn(),
        isFollowing,
        listFollowers: jest.fn(),
        listFollowings: jest.fn(),
        removeFollower: jest.fn(),
    };
    const mapper = new ProfileMapperService(assetUrl);
    const useCase = new GetAdopterProfileUseCase(reader, follow, mapper);

    beforeEach(() => {
        jest.clearAllMocks();
        reader.readAdopter.mockResolvedValue(adopterSnapshot);
        isFollowing.mockResolvedValue(false);
    });

    it('입양자 없음이면 BadRequest', async () => {
        reader.readAdopter.mockResolvedValueOnce(null);

        await expect(useCase.execute('missing')).rejects.toThrow(BadRequestException);
        expect(isFollowing).not.toHaveBeenCalled();
    });

    it('비로그인 조회는 isFollowing=false이고 관계 조회를 생략한다', async () => {
        const result = await useCase.execute('adopter-1');

        expect(result.isFollowing).toBe(false);
        expect(result.profileImageUrl).toBe('https://signed/profile.jpg');
        expect(isFollowing).not.toHaveBeenCalled();
    });

    it('로그인한 다른 사용자는 실제 팔로우 여부를 응답한다', async () => {
        isFollowing.mockResolvedValueOnce(true);

        const result = await useCase.execute('adopter-1', 'viewer-1');

        expect(isFollowing).toHaveBeenCalledWith('viewer-1', 'adopter-1');
        expect(result.isFollowing).toBe(true);
    });

    it('본인 프로필 조회는 isFollowing=false이고 관계 조회를 생략한다', async () => {
        const result = await useCase.execute('adopter-1', 'adopter-1');

        expect(result.isFollowing).toBe(false);
        expect(isFollowing).not.toHaveBeenCalled();
    });
});
