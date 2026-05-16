import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';
import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import type { CommunityPostCardResponseDto } from '../../dto/response/community-post-card.dto';
import {
    COMMUNITY_POST_READER_PORT,
    type CommunityPostReaderPort,
} from '../ports/community-post-reader.port';
import type { CommunityPetType, CommunityPostSort } from '../types/community-post.type';

const PAGE_SIZE_DEFAULT = 15;
const PAGE_SIZE_MAX = 60;

@Injectable()
export class GetCommunityPostListUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        private readonly mapper: CommunityPostMapperService,
    ) {}

    async execute(input: {
        petType?: CommunityPetType;
        category?: string;
        authorId?: string;
        sort?: CommunityPostSort;
        page?: number;
        pageSize?: number;
    }): Promise<PageResult<CommunityPostCardResponseDto>> {
        const page = Math.max(1, input.page ?? 1);
        const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize ?? PAGE_SIZE_DEFAULT));
        const sort: CommunityPostSort = input.sort ?? 'latest';

        const { snapshots, totalItems } = await this.reader.listPosts({
            petType: input.petType,
            category: input.category,
            authorId: input.authorId,
            sort,
            skip: (page - 1) * pageSize,
            limit: pageSize,
        });

        const items = snapshots.map((s) => this.mapper.toCard(s));
        return buildPageResult(items, page, pageSize, totalItems);
    }
}
