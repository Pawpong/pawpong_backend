import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult } from '../../../../common/types/page-result.type';
import { AdoptionPetMapperService } from '../../domain/services/adoption-pet-mapper.service';
import {
    ADOPTER_PET_FAVORITE_READER_PORT,
    type AdopterPetFavoriteReaderPort,
} from '../ports/adopter-pet-favorite.port';
import { ADOPTION_ASSET_URL_PORT, type AdoptionAssetUrlPort } from '../ports/adoption-asset-url.port';
import type { AdoptionPetStatus } from '../ports/adoption-pet-reader.port';
import type { AdoptionPetItemResult, AdoptionPetListResult } from '../types/adoption-result.type';

const PAGE_SIZE_DEFAULT = 15;
const PAGE_SIZE_MAX = 60;

/**
 * GET /v2/adoption/me/favorites — 입양자 본인의 즐겨찾기 펫 페이지네이션.
 *
 * 모바일 "저장 목록 — 입양 관심" 탭(Figma 290:2691) 의 백엔드 진입점.
 * status 필터(available/reserved/adopted) 와 추가 시각 desc 정렬을 지원한다.
 */
@Injectable()
export class GetMyAdoptionFavoritesUseCase {
    constructor(
        @Inject(ADOPTER_PET_FAVORITE_READER_PORT)
        private readonly favoriteReader: AdopterPetFavoriteReaderPort,
        @Inject(ADOPTION_ASSET_URL_PORT)
        private readonly assetUrlPort: AdoptionAssetUrlPort,
        private readonly mapper: AdoptionPetMapperService,
    ) {}

    async execute(input: {
        adopterId: string;
        status?: AdoptionPetStatus;
        page?: number;
        pageSize?: number;
    }): Promise<AdoptionPetListResult> {
        const page = Math.max(1, input.page ?? 1);
        const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize ?? PAGE_SIZE_DEFAULT));

        const { snapshots, totalItems } = await this.favoriteReader.listMyFavoritedPets(input.adopterId, {
            statusFilter: input.status,
            skip: (page - 1) * pageSize,
            limit: pageSize,
        });

        const items: AdoptionPetItemResult[] = await Promise.all(
            snapshots.map(async (snapshot) => {
                const photoUrls = await Promise.all(
                    snapshot.photos.map((fileName) => this.assetUrlPort.generateSignedUrl(fileName)),
                );
                // 본 목록은 정의상 모두 즐겨찾기 등록 상태이므로 isFavorited=true 고정
                return this.mapper.toItem(snapshot, photoUrls, true);
            }),
        );

        return buildPageResult(items, page, pageSize, totalItems);
    }
}
