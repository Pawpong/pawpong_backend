import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../../common/types/page-result.type';

import { COMMUNITY_HALL_OF_FAME_PORT, type CommunityHallOfFamePort } from '../ports/community-hall-of-fame.port';
import { CommunityHallOfFameMapperService } from '../../domain/services/community-hall-of-fame-mapper.service';
import type { CommunityHallOfFameResult } from '../types/community-hall-of-fame-result.type';

/** 확정된(final) 회차만 최신순으로 내려준다. 진행 중 회차는 current 엔드포인트로 조회한다. */
@Injectable()
export class GetCommunityHallOfFameHistoryUseCase {
    constructor(
        @Inject(COMMUNITY_HALL_OF_FAME_PORT)
        private readonly hallOfFamePort: CommunityHallOfFamePort,
        private readonly mapperService: CommunityHallOfFameMapperService,
    ) {}

    async execute(input: { page?: number; pageSize?: number }): Promise<PageResult<CommunityHallOfFameResult>> {
        const page = input.page ?? 1;
        const pageSize = input.pageSize ?? 10;

        const { items, totalItems } = await this.hallOfFamePort.findFinalized((page - 1) * pageSize, pageSize);

        return buildPageResult(
            items.map((snapshot) => this.mapperService.toResult(snapshot)),
            page,
            pageSize,
            totalItems,
        );
    }
}
