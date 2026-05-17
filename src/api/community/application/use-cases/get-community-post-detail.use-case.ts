import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityPostDetailResult } from '../types/community-post-result.type';

const COMMENT_PREVIEW_LIMIT = 5;

/**
 * GET /v2/community/posts/:postId — 게시글 상세 + 댓글 첫 페이지.
 * 더 많은 댓글은 GET /v2/community/posts/:postId/comments 페이지네이션.
 */
@Injectable()
export class GetCommunityPostDetailUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        private readonly mapper: CommunityPostMapperService,
    ) {}

    async execute(postId: string): Promise<CommunityPostDetailResult> {
        const snapshot = await this.reader.readPostById(postId);
        if (!snapshot) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }

        const { snapshots: commentSnapshots } = await this.reader.listComments({
            postId,
            skip: 0,
            limit: COMMENT_PREVIEW_LIMIT,
        });
        const commentPreview = commentSnapshots.map((c) => this.mapper.toComment(c));

        return this.mapper.toDetail(snapshot, commentPreview);
    }
}
