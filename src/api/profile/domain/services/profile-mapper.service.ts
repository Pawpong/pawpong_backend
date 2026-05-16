import { Injectable, Inject } from '@nestjs/common';

import { PROFILE_ASSET_URL_PORT, type ProfileAssetUrlPort } from '../../application/ports/profile-asset-url.port';
import type {
    AdopterProfileSnapshot,
    BreederProfileSnapshot,
    FavoriteBreederCardSnapshot,
} from '../../application/types/profile.type';
import { AdopterPublicProfileResponseDto } from '../../dto/response/adopter-profile-response.dto';
import { BreederPublicProfileResponseDto } from '../../dto/response/breeder-profile-response.dto';
import { FavoriteBreederCardResponseDto } from '../../dto/response/favorite-breeder-card.dto';
import { MyProfileResponseDto } from '../../dto/response/my-profile-response.dto';

@Injectable()
export class ProfileMapperService {
    constructor(
        @Inject(PROFILE_ASSET_URL_PORT)
        private readonly assetUrl: ProfileAssetUrlPort,
    ) {}

    toMyAdopterDto(snapshot: AdopterProfileSnapshot): MyProfileResponseDto {
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

    toMyBreederDto(snapshot: BreederProfileSnapshot): MyProfileResponseDto {
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

    toAdopterPublicDto(snapshot: AdopterProfileSnapshot, isFollowing: boolean): AdopterPublicProfileResponseDto {
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

    toBreederPublicDto(snapshot: BreederProfileSnapshot, isFavorited: boolean): BreederPublicProfileResponseDto {
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

    toFavoriteBreederCardDto(snapshot: FavoriteBreederCardSnapshot): FavoriteBreederCardResponseDto {
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
