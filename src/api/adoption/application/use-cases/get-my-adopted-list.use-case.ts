import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';
import { AdoptionPetMapperService } from '../../domain/services/adoption-pet-mapper.service';
import type { AdoptedPetCardResponseDto } from '../../dto/response/adopted-pet-card.dto';
import { ADOPTION_ASSET_URL_PORT, type AdoptionAssetUrlPort } from '../ports/adoption-asset-url.port';
import {
    ADOPTION_RECORD_READER_PORT,
    type AdoptionRecordReaderPort,
} from '../ports/adoption-record-reader.port';

const PAGE_SIZE_DEFAULT = 15;
const PAGE_SIZE_MAX = 60;

/**
 * GET /v2/adoption/me/adopted — "내가 입양한 목록" (Figma 296:3286).
 * AdoptionApplication 의 status='adoption_approved' 인 신청을 입양 확정 시각 desc 로 페이지네이션.
 */
@Injectable()
export class GetMyAdoptedListUseCase {
    constructor(
        @Inject(ADOPTION_RECORD_READER_PORT)
        private readonly recordReader: AdoptionRecordReaderPort,
        @Inject(ADOPTION_ASSET_URL_PORT)
        private readonly assetUrlPort: AdoptionAssetUrlPort,
        private readonly mapper: AdoptionPetMapperService,
    ) {}

    async execute(input: {
        adopterId: string;
        page?: number;
        pageSize?: number;
    }): Promise<PageResult<AdoptedPetCardResponseDto>> {
        const page = Math.max(1, input.page ?? 1);
        const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize ?? PAGE_SIZE_DEFAULT));

        const { items, totalItems } = await this.recordReader.listMyAdopted({
            adopterId: input.adopterId,
            skip: (page - 1) * pageSize,
            limit: pageSize,
        });

        const cards: AdoptedPetCardResponseDto[] = await Promise.all(
            items.map(async (record) => {
                const photoUrls = await Promise.all(
                    record.pet.photos.map((fileName) => this.assetUrlPort.generateSignedUrl(fileName)),
                );
                // 본인이 입양한 펫이므로 isFavorited 의미가 없음 — UI 에서 미사용 가정. true 로 두어도 무관하나,
                // 카드 컴포넌트가 동일 DTO 를 다루므로 false 고정.
                const base = this.mapper.toItem(record.pet, photoUrls, false);
                return { ...base, adoptedAt: record.adoptedAt.toISOString() };
            }),
        );

        return buildPageResult(cards, page, pageSize, totalItems);
    }
}
