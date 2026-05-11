import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';
import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import type { CommunityPostCommentResponseDto } from '../../dto/response/community-post-comment.dto';
import {
    COMMUNITY_POST_READER_PORT,
    type CommunityPostReaderPort,
} from '../ports/community-post-reader.port';

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

/**
 * GET /v2/community/posts/:postId/comments — 게시글 댓글 페이지네이션.
 */
@Injectable()
export class GetCommunityPostCommentsUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        private readonly mapper: CommunityPostMapperService,
    ) {}

    async execute(input: {
        postId: string;
        page?: number;
        pageSize?: number;
    }): Promise<PageResult<CommunityPostCommentResponseDto>> {
        const page = Math.max(1, input.page ?? 1);
        const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize ?? PAGE_SIZE_DEFAULT));

        // page=1 일 때만 게시글 존재 확인 (이후 페이지는 첫 페이지에서 검증됐다고 가정 — 비용 절감)
        if (page === 1) {
            const post = await this.reader.readPostById(input.postId);
            if (!post) {
                throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
            }
        }

        const { snapshots, totalItems } = await this.reader.listComments({
            postId: input.postId,
            skip: (page - 1) * pageSize,
            limit: pageSize,
        });

        const items = snapshots.map((s) => this.mapper.toComment(s));
        return buildPageResult(items, page, pageSize, totalItems);
    }
}
