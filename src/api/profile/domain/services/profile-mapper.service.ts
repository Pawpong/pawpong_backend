import { Injectable, Inject } from '@nestjs/common';

import { PROFILE_ASSET_URL_PORT, type ProfileAssetUrlPort } from '../../application/ports/profile-asset-url.port';
import type {
    AdopterProfileSnapshot,
    BreederProfileSnapshot,
    FavoriteBreederCardSnapshot,
} from '../../application/types/profile.type';
import type {
    AdopterPublicProfileResult,
    BreederPublicProfileResult,
    FavoriteBreederCardResult,
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
            level: snapshot.level,
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
            isFollowing,
        };
    }

    toBreederPublicDto(snapshot: BreederProfileSnapshot, isFavorited: boolean): BreederPublicProfileResult {
        return {
            breederId: snapshot.breederId,
            nickname: snapshot.nickname,
            profileImageUrl: this.assetUrl.toProfileImageUrl(snapshot.profileImageFileName),
            bio: snapshot.bio,
            longDescription: snapshot.longDescription,
            bpm: snapshot.bpm,
            followerCount: snapshot.followerCount,
            level: snapshot.level,
            plan: snapshot.plan,
            businessLocation: snapshot.businessLocation,
            isFavorited,
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
            level: snapshot.level,
            addedAt: snapshot.addedAt.toISOString(),
        };
    }
}
