import { Injectable } from '@nestjs/common';

import type { FavoriteBreederInfo } from '../../../schema/adopter.schema';
import type { ProfileReaderPort, FavoriteBreedersPageResult } from '../application/ports/profile-reader.port';
import type {
    AdopterProfileSnapshot,
    BreederProfileSnapshot,
    FavoriteBreederCardSnapshot,
} from '../application/types/profile.type';
import { ProfileRepository } from '../repository/profile.repository';

@Injectable()
export class ProfileReaderMongooseAdapter implements ProfileReaderPort {
    constructor(private readonly repository: ProfileRepository) {}

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
            followerCount: breeder.stats?.totalFavorites ?? 0,
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
        const adopter = await this.repository.findAdopterById(adopterId);
        if (!adopter || !Array.isArray(adopter.favoriteBreederList)) {
            return { items: [], totalItems: 0 };
        }

        const all: FavoriteBreederInfo[] = [...adopter.favoriteBreederList].sort(
            (a, b) => (b.addedAt?.getTime?.() ?? 0) - (a.addedAt?.getTime?.() ?? 0),
        );
        const totalItems = all.length;
        const start = (pagination.page - 1) * pagination.pageSize;
        const slice = all.slice(start, start + pagination.pageSize);

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
                breederLocation: entry.breederLocation,
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
