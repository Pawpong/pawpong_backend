import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';
import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import type { CommunityPostCommentResponseDto } from '../../dto/response/community-post-comment.dto';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';

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

        // 모든 페이지에서 일관되게 게시글 존재(+isActive) 검증 — 잘못된 postId 로 page=2 호출 시도 BadRequest 통일.
        // 전체 도큐먼트를 가져오지 않는 가벼운 exists 쿼리 사용.
        const exists = await this.reader.existsActivePost(input.postId);
        if (!exists) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
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
