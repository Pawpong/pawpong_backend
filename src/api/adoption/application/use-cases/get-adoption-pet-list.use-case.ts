import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult } from '../../../../common/types/page-result.type';
import { AdoptionPetMapperService } from '../../domain/services/adoption-pet-mapper.service';
import {
    ADOPTER_PET_FAVORITE_READER_PORT,
    type AdopterPetFavoriteReaderPort,
} from '../ports/adopter-pet-favorite.port';
import { ADOPTION_ASSET_URL_PORT, type AdoptionAssetUrlPort } from '../ports/adoption-asset-url.port';
import {
    ADOPTION_PET_READER_PORT,
    type AdoptionPetListQuery,
    type AdoptionPetReaderPort,
    type AdoptionPetSnapshot,
    type AdoptionPetStatus,
} from '../ports/adoption-pet-reader.port';
import type { AdoptionPetItemResult, AdoptionPetListResult } from '../types/adoption-result.type';

const PAGE_SIZE_DEFAULT = 15;
const PAGE_SIZE_MAX = 60;

@Injectable()
export class GetAdoptionPetListUseCase {
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
        petType?: AdoptionPetSnapshot['petType'];
        breederId?: string;
        excludePetId?: string;
        status?: AdoptionPetStatus;
        sort?: AdoptionPetListQuery['sort'];
        page?: number;
        pageSize?: number;
        adopterId?: string;
    }): Promise<AdoptionPetListResult> {
        const page = Math.max(1, input.page ?? 1);
        const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize ?? PAGE_SIZE_DEFAULT));
        const sort = input.sort ?? 'latest';

        const query: AdoptionPetListQuery = {
            petType: input.petType,
            breederId: input.breederId,
            excludePetId: input.excludePetId,
            status: input.status,
            sort,
            skip: (page - 1) * pageSize,
            limit: pageSize,
        };

        const [totalItems, snapshots] = await Promise.all([
            this.petReader.countList({
                petType: input.petType,
                breederId: input.breederId,
                excludePetId: input.excludePetId,
                status: input.status,
            }),
            this.petReader.readList(query),
        ]);

        const items = await this.toItems(snapshots, input.adopterId);
        return buildPageResult(items, page, pageSize, totalItems);
    }

    private async toItems(snapshots: AdoptionPetSnapshot[], adopterId?: string): Promise<AdoptionPetItemResult[]> {
        if (snapshots.length === 0) {
            return [];
        }

        const favoritedSet = adopterId
            ? await this.favoriteReader.findFavoritedPetIds(
                  adopterId,
                  snapshots.map((s) => s.id),
              )
            : new Set<string>();

        return Promise.all(
            snapshots.map(async (snapshot) => {
                const photoUrls = await Promise.all(
                    snapshot.photos.map((fileName) => this.assetUrlPort.generateSignedUrl(fileName)),
                );
                return this.mapper.toItem(snapshot, photoUrls, favoritedSet.has(snapshot.id));
            }),
        );
    }
}
