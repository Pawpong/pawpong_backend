import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import { COMMUNITY_BOOKMARK_PORT, type CommunityBookmarkPort } from '../ports/community-bookmark.port';
import { COMMUNITY_LIKE_PORT, type CommunityLikePort } from '../ports/community-like.port';
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
        @Inject(COMMUNITY_LIKE_PORT)
        private readonly likePort: CommunityLikePort,
        @Inject(COMMUNITY_BOOKMARK_PORT)
        private readonly bookmarkPort: CommunityBookmarkPort,
        private readonly mapper: CommunityPostMapperService,
    ) {}

    async execute(postId: string, userId?: string): Promise<CommunityPostDetailResult> {
        const snapshot = await this.reader.readPostById(postId);
        if (!snapshot) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }

        const [{ snapshots: commentSnapshots }, isLiked, savedSet] = await Promise.all([
            this.reader.listComments({ postId, skip: 0, limit: COMMENT_PREVIEW_LIMIT }),
            userId ? this.likePort.isLiked(userId, postId) : Promise.resolve(false),
            userId ? this.bookmarkPort.findSavedPostIds(userId, [postId]) : Promise.resolve(new Set<string>()),
        ]);
        const commentPreview = commentSnapshots.map((c) => this.mapper.toComment(c));

        return this.mapper.toDetail(snapshot, commentPreview, isLiked, savedSet.has(postId));
    }
}
