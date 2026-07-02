import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import { COMMUNITY_BOOKMARK_PORT, type CommunityBookmarkPort } from '../ports/community-bookmark.port';
import { COMMUNITY_FOLLOW_READER_PORT, type CommunityFollowReaderPort } from '../ports/community-follow-reader.port';
import { COMMUNITY_LIKE_PORT, type CommunityLikePort } from '../ports/community-like.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityPostDetailResult } from '../types/community-post-result.type';
import type { CommunityPostSnapshot } from '../types/community-post.type';

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
        @Inject(COMMUNITY_FOLLOW_READER_PORT)
        private readonly followReader: CommunityFollowReaderPort,
        private readonly mapper: CommunityPostMapperService,
    ) {}

    async execute(postId: string, userId?: string): Promise<CommunityPostDetailResult> {
        const snapshot = await this.reader.readPostById(postId);
        if (!snapshot) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }

        await this.assertViewable(snapshot, userId);

        const [{ snapshots: commentSnapshots }, isLiked, savedSet] = await Promise.all([
            this.reader.listComments({ postId, skip: 0, limit: COMMENT_PREVIEW_LIMIT }),
            userId ? this.likePort.isLiked(userId, postId) : Promise.resolve(false),
            userId ? this.bookmarkPort.findSavedPostIds(userId, [postId]) : Promise.resolve(new Set<string>()),
        ]);
        const commentPreview = commentSnapshots.map((c) => this.mapper.toComment(c));

        return this.mapper.toDetail(snapshot, commentPreview, isLiked, savedSet.has(postId));
    }

    /**
     * 임시저장/공개범위에 따른 상세 열람 권한을 검증한다.
     * 존재를 노출하지 않도록 권한 없음도 '찾을 수 없음'으로 응답한다.
     */
    private async assertViewable(snapshot: CommunityPostSnapshot, userId?: string): Promise<void> {
        const isAuthor = !!userId && userId === snapshot.authorId;
        if (isAuthor) return;

        // 임시저장/나만보기 글은 작성자 본인만 열람 가능
        if (snapshot.status === 'draft' || snapshot.visibility === 'private') {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }

        // 팔로워공개 글은 작성자를 팔로우한 사용자만 열람 가능
        if (snapshot.visibility === 'followers') {
            const canView = !!userId && (await this.followReader.isFollowing(userId, snapshot.authorId));
            if (!canView) {
                throw new BadRequestException('팔로워에게만 공개된 게시글입니다.');
            }
        }
    }
}
