import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';
import type { CommunityPostCardResponseDto } from '../../dto/response/community-post-card.dto';
import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import { COMMUNITY_BOOKMARK_PORT, type CommunityBookmarkPort } from '../ports/community-bookmark.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';

const PAGE_SIZE_DEFAULT = 15;
const PAGE_SIZE_MAX = 60;

@Injectable()
export class GetMySavedCommunityPostsUseCase {
    constructor(
        @Inject(COMMUNITY_BOOKMARK_PORT)
        private readonly bookmark: CommunityBookmarkPort,
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        private readonly mapper: CommunityPostMapperService,
    ) {}

    async execute(input: {
        userId: string;
        page?: number;
        pageSize?: number;
    }): Promise<PageResult<CommunityPostCardResponseDto>> {
        const page = Math.max(1, input.page ?? 1);
        const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize ?? PAGE_SIZE_DEFAULT));

        const { postIds, totalItems } = await this.bookmark.listSavedPostIds(
            input.userId,
            (page - 1) * pageSize,
            pageSize,
        );

        if (postIds.length === 0) {
            return buildPageResult([], page, pageSize, totalItems);
        }

        // 저장 순서 유지하며 active 게시글만 포함
        const snapshots = (await Promise.all(postIds.map((id) => this.reader.readPostById(id)))).filter(
            (s): s is NonNullable<typeof s> => s !== null,
        );

        const items = snapshots.map((s) => this.mapper.toCard(s));
        return buildPageResult(items, page, pageSize, totalItems);
    }
}
