import { Inject, Injectable } from '@nestjs/common';

import {
    ADOPTER_FAVORITE_READER_PORT,
    type AdopterFavoriteReaderPort,
} from '../../adopter/application/ports/adopter-favorite-reader.port';
import type { ProfileReaderPort, FavoriteBreedersPageResult } from '../application/ports/profile-reader.port';
import type {
    AdopterProfileSnapshot,
    BreederProfileSnapshot,
    FavoriteBreederCardSnapshot,
} from '../application/types/profile.type';
import { ProfileRepository } from '../repository/profile.repository';

@Injectable()
export class ProfileReaderMongooseAdapter implements ProfileReaderPort {
    constructor(
        private readonly repository: ProfileRepository,
        @Inject(ADOPTER_FAVORITE_READER_PORT)
        private readonly adopterFavoriteReaderPort: AdopterFavoriteReaderPort,
    ) {}

    async readAdopter(userId: string): Promise<AdopterProfileSnapshot | null> {
        const adopter = await this.repository.findAdopterById(userId);
        if (!adopter) return null;

        return {
            userId: String(adopter._id),
            nickname: adopter.nickname,
            profileImageFileName: adopter.profileImageFileName ?? undefined,
            bio: adopter.bio ?? '',
            bpm: adopter.bpm ?? 0,
            followerCount: adopter.followerCount ?? 0,
            followingCount: adopter.followingCount ?? 0,
            favoriteBreederCount: adopter.favoriteBreederList?.length ?? 0,
        };
    }

    async readBreeder(breederId: string): Promise<BreederProfileSnapshot | null> {
        const breeder = await this.repository.findBreederById(breederId);
        if (!breeder) return null;

        return {
            breederId: String(breeder._id),
            nickname: breeder.nickname,
            profileImageFileName: breeder.profileImageFileName ?? undefined,
            bio: breeder.bio ?? '',
            longDescription: breeder.profile?.description ?? '',
            bpm: breeder.bpm ?? 0,
            followerCount: breeder.stats?.followerCount ?? 0,
            followingCount: breeder.stats?.followingCount ?? 0,
            level: (breeder.verification?.level as 'new' | 'elite') ?? 'new',
            plan: (breeder.verification?.plan as 'basic' | 'pro') ?? 'basic',
            businessLocation: {
                city: breeder.profile?.location?.city ?? '',
                district: breeder.profile?.location?.district ?? '',
                address: breeder.profile?.location?.address,
            },
        };
    }

    async listFavoriteBreeders(
        adopterId: string,
        pagination: { page: number; pageSize: number },
    ): Promise<FavoriteBreedersPageResult> {
        // 즐겨찾기 원본 데이터(favoriteBreederList) 조회·페이지네이션·정렬(addedAt DESC)은
        // adopter 도메인이 소유한 ADOPTER_FAVORITE_READER_PORT 에 위임한다 —
        // 여기서 Mongo 쿼리를 직접 재구현하지 않는다.
        const { favorites: slice, total: totalItems } = await this.adopterFavoriteReaderPort.findFavoriteList(
            adopterId,
            pagination.page,
            pagination.pageSize,
        );

        if (slice.length === 0) {
            return { items: [], totalItems };
        }

        const breederIds = slice.map((entry) => entry.favoriteBreederId);
        const [breeders, recentPetStatusMap] = await Promise.all([
            this.repository.findBreedersByIds(breederIds),
            this.repository.findRecentPetStatusByBreederIds(breederIds),
        ]);

        const breederById = new Map(breeders.map((b) => [String(b._id), b]));
        const items: FavoriteBreederCardSnapshot[] = slice.map((entry) => {
            const breeder = breederById.get(entry.favoriteBreederId);
            return {
                breederId: entry.favoriteBreederId,
                nickname: breeder?.nickname ?? entry.breederName,
                profileImageFileName: breeder?.profileImageFileName ?? undefined,
                breederLocation: entry.breederLocation ?? '',
                recentPetStatus: recentPetStatusMap.get(entry.favoriteBreederId),
                bpm: breeder?.bpm ?? 0,
                level: (breeder?.verification?.level as 'new' | 'elite' | undefined) ?? undefined,
                addedAt: entry.addedAt,
            };
        });

        return { items, totalItems };
    }

    async isFavoritedBy(adopterId: string, breederId: string): Promise<boolean> {
        return this.repository.isFavoritedBy(adopterId, breederId);
    }
}
