import { Injectable, Inject } from '@nestjs/common';

import { PROFILE_ASSET_URL_PORT, type ProfileAssetUrlPort } from '../../application/ports/profile-asset-url.port';
import type {
    AdopterProfileSnapshot,
    BreederProfileSnapshot,
    FavoriteBreederCardSnapshot,
    FollowUserCardSnapshot,
} from '../../application/types/profile.type';
import type {
    AdopterPublicProfileResult,
    BreederPublicProfileResult,
    FavoriteBreederCardResult,
    FollowUserCardResult,
    MyProfileResult,
} from '../../application/types/profile-result.type';

@Injectable()
export class ProfileMapperService {
    constructor(
        @Inject(PROFILE_ASSET_URL_PORT)
        private readonly assetUrl: ProfileAssetUrlPort,
    ) {}

    toMyAdopterDto(snapshot: AdopterProfileSnapshot): MyProfileResult {
        return {
            role: 'adopter',
            userId: snapshot.userId,
            nickname: snapshot.nickname,
            profileImageUrl: this.assetUrl.toProfileImageUrl(snapshot.profileImageFileName),
            bio: snapshot.bio,
            bpm: snapshot.bpm,
            followerCount: snapshot.followerCount,
            followingCount: snapshot.followingCount,
            favoriteBreederCount: snapshot.favoriteBreederCount,
        };
    }

    toMyBreederDto(snapshot: BreederProfileSnapshot): MyProfileResult {
        return {
            role: 'breeder',
            userId: snapshot.breederId,
            nickname: snapshot.nickname,
            profileImageUrl: this.assetUrl.toProfileImageUrl(snapshot.profileImageFileName),
            bio: snapshot.bio,
            bpm: snapshot.bpm,
            followerCount: snapshot.followerCount,
            followingCount: snapshot.followingCount,
            plan: snapshot.plan,
            businessLocation: snapshot.businessLocation,
            longDescription: snapshot.longDescription,
        };
    }

    toAdopterPublicDto(snapshot: AdopterProfileSnapshot, isFollowing: boolean): AdopterPublicProfileResult {
        return {
            userId: snapshot.userId,
            nickname: snapshot.nickname,
            profileImageUrl: this.assetUrl.toProfileImageUrl(snapshot.profileImageFileName),
            bio: snapshot.bio,
            bpm: snapshot.bpm,
            followerCount: snapshot.followerCount,
            followingCount: snapshot.followingCount,
            isFollowing,
        };
    }

    toBreederPublicDto(
        snapshot: BreederProfileSnapshot,
        isFavorited: boolean,
        isFollowing: boolean,
    ): BreederPublicProfileResult {
        return {
            breederId: snapshot.breederId,
            nickname: snapshot.nickname,
            profileImageUrl: this.assetUrl.toProfileImageUrl(snapshot.profileImageFileName),
            bio: snapshot.bio,
            longDescription: snapshot.longDescription,
            bpm: snapshot.bpm,
            followerCount: snapshot.followerCount,
            followingCount: snapshot.followingCount,
            plan: snapshot.plan,
            businessLocation: snapshot.businessLocation,
            isFavorited,
            isFollowing,
        };
    }

    toFavoriteBreederCardDto(snapshot: FavoriteBreederCardSnapshot): FavoriteBreederCardResult {
        return {
            breederId: snapshot.breederId,
            nickname: snapshot.nickname,
            profileImageUrl: this.assetUrl.toProfileImageUrl(snapshot.profileImageFileName),
            breederLocation: snapshot.breederLocation,
            recentPetStatus: snapshot.recentPetStatus,
            bpm: snapshot.bpm,
            addedAt: snapshot.addedAt.toISOString(),
            isFavorited: true,
        };
    }

    /** 친구 목록 모달(팔로워/팔로잉) 카드 변환 */
    toFollowUserCardDto(snapshot: FollowUserCardSnapshot): FollowUserCardResult {
        return {
            userId: snapshot.userId,
            nickname: snapshot.nickname,
            profileImageUrl: this.assetUrl.toProfileImageUrl(snapshot.profileImageFileName),
            bio: snapshot.bio,
            isFollowing: snapshot.isFollowing,
            isFollowedBy: snapshot.isFollowedBy,
            followedAt: snapshot.followedAt.toISOString(),
        };
    }
}
