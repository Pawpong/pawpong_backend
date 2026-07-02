import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';
import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import { COMMUNITY_BOOKMARK_PORT, type CommunityBookmarkPort } from '../ports/community-bookmark.port';
import { COMMUNITY_FOLLOW_READER_PORT, type CommunityFollowReaderPort } from '../ports/community-follow-reader.port';
import { COMMUNITY_LIKE_PORT, type CommunityLikePort } from '../ports/community-like.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityPostCardResult } from '../types/community-post-result.type';
import type { CommunityPetType, CommunityPostSort, CommunityPostStatus } from '../types/community-post.type';

const PAGE_SIZE_DEFAULT = 15;
const PAGE_SIZE_MAX = 60;

@Injectable()
export class GetCommunityPostListUseCase {
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

    async execute(input: {
        petType?: CommunityPetType;
        category?: string;
        authorId?: string;
        sort?: CommunityPostSort;
        page?: number;
        pageSize?: number;
        /** 현재 요청 사용자 ID. 없으면 isLiked/isSaved 는 모두 false. */
        userId?: string;
        /** 조회 상태. draft 는 본인 임시저장 목록 전용(뷰어 본인 글로 강제 제한). */
        status?: CommunityPostStatus;
    }): Promise<PageResult<CommunityPostCardResult>> {
        const page = Math.max(1, input.page ?? 1);
        const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize ?? PAGE_SIZE_DEFAULT));
        const sort: CommunityPostSort = input.sort ?? 'latest';
        const status: CommunityPostStatus = input.status ?? 'published';

        // 발행 피드는 팔로워공개 열람 판정을 위해 뷰어가 팔로우한 작성자 목록을 미리 조회한다.
        // (임시저장 조회는 본인 글만 보므로 팔로우 조회가 필요 없다.)
        const viewerFolloweeIds =
            input.userId && status !== 'draft' ? await this.followReader.listFolloweeIds(input.userId) : undefined;

        const { snapshots, totalItems } = await this.reader.listPosts({
            petType: input.petType,
            category: input.category,
            authorId: input.authorId,
            sort,
            skip: (page - 1) * pageSize,
            limit: pageSize,
            status,
            viewerId: input.userId,
            viewerFolloweeIds,
        });

        const postIds = snapshots.map((s) => s.postId);

        const [likedSet, savedSet] = input.userId
            ? await Promise.all([
                  this.likePort.findLikedPostIds(input.userId, postIds),
                  this.bookmarkPort.findSavedPostIds(input.userId, postIds),
              ])
            : [new Set<string>(), new Set<string>()];

        const items = snapshots.map((s) =>
            this.mapper.toCard(s, likedSet.has(s.postId), savedSet.has(s.postId)),
        );
        return buildPageResult(items, page, pageSize, totalItems);
    }
}
