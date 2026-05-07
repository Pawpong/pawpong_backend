import { Inject, Injectable } from '@nestjs/common';

import { AdoptionPetMapperService } from '../../domain/services/adoption-pet-mapper.service';
import {
    ADOPTER_PET_FAVORITE_READER_PORT,
    type AdopterPetFavoriteReaderPort,
} from '../ports/adopter-pet-favorite.port';
import { ADOPTION_ASSET_URL_PORT, type AdoptionAssetUrlPort } from '../ports/adoption-asset-url.port';
import {
    ADOPTION_PET_READER_PORT,
    type AdoptionPetReaderPort,
    type AdoptionPetType,
} from '../ports/adoption-pet-reader.port';
import type { AdoptionPetItemResult } from '../types/adoption-result.type';

const POPULAR_LIMIT_DEFAULT = 3;
const POPULAR_LIMIT_MAX = 20;

@Injectable()
export class GetPopularAdoptionPetsUseCase {
    constructor(
        @Inject(ADOPTION_PET_READER_PORT)
        private readonly petReader: AdoptionPetReaderPort,
        @Inject(ADOPTER_PET_FAVORITE_READER_PORT)
        private readonly favoriteReader: AdopterPetFavoriteReaderPort,
        @Inject(ADOPTION_ASSET_URL_PORT)
        private readonly assetUrlPort: AdoptionAssetUrlPort,
        private readonly mapper: AdoptionPetMapperService,
    ) {}

    async execute(input: {
        petType?: AdoptionPetType;
        limit?: number;
        adopterId?: string;
    }): Promise<AdoptionPetItemResult[]> {
        const limit = Math.min(POPULAR_LIMIT_MAX, Math.max(1, input.limit ?? POPULAR_LIMIT_DEFAULT));
        const snapshots = await this.petReader.readPopular(input.petType, limit);

        const favoritedSet = input.adopterId
            ? await this.favoriteReader.findFavoritedPetIds(
                  input.adopterId,
                  snapshots.map((s) => s.id),
              )
            : new Set<string>();

        return Promise.all(
            snapshots.map(async (snapshot) => {
                const photoUrls = await Promise.all(
                    snapshot.photos.map((fileName) => this.assetUrlPort.generateSignedUrl(fileName)),
                );
                // 인기 동물 카드는 항상 isPopular=true 로 노출 (인기🔥 배지)
                return this.mapper.toItem(snapshot, photoUrls, favoritedSet.has(snapshot.id), true);
            }),
        );
    }
}
