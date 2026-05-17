import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';
import { BreederPetPostingCardMapperService } from '../../domain/services/breeder-pet-posting-card-mapper.service';
import type { BreederPetPostingCardResult } from '../types/breeder-pet-posting-result.type';
import {
    BREEDER_PET_POSTING_READER_PORT,
    type BreederPetPostingReaderPort,
    type BreederPetPostingStatus,
} from '../ports/breeder-pet-posting-reader.port';

const PAGE_SIZE_DEFAULT = 15;
const PAGE_SIZE_MAX = 60;

/**
 * GET /v2/breeder-pet-posting/me — 브리더 본인의 분양글 목록.
 *
 * Figma 마이홈 분양목록 탭(290:795) 의 백엔드 진입점.
 * status 필터(available/reserved/adopted) + 작성 시각 desc 정렬.
 */
@Injectable()
export class ListMyBreederPetPostingsUseCase {
    constructor(
        @Inject(BREEDER_PET_POSTING_READER_PORT)
        private readonly reader: BreederPetPostingReaderPort,
        private readonly cardMapper: BreederPetPostingCardMapperService,
    ) {}

    async execute(input: {
        breederId: string;
        status?: BreederPetPostingStatus;
        page?: number;
        pageSize?: number;
    }): Promise<PageResult<BreederPetPostingCardResult>> {
        const page = Math.max(1, input.page ?? 1);
        const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize ?? PAGE_SIZE_DEFAULT));

        const { snapshots, totalItems } = await this.reader.listMyPostings({
            breederId: input.breederId,
            status: input.status,
            skip: (page - 1) * pageSize,
            limit: pageSize,
        });

        const items = snapshots.map((s) => this.cardMapper.toCard(s));
        return buildPageResult(items, page, pageSize, totalItems);
    }
}
