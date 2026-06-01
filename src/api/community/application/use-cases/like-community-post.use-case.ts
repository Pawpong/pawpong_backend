import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_LIKE_PORT, type CommunityLikePort } from '../ports/community-like.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityAuthorModel } from '../types/community-post.type';

@Injectable()
export class LikeCommunityPostUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_LIKE_PORT)
        private readonly likePort: CommunityLikePort,
    ) {}

    async execute(
        postId: string,
        userId: string,
        userModel: CommunityAuthorModel,
    ): Promise<{ postId: string; liked: boolean }> {
        const exists = await this.reader.existsActivePost(postId);
        if (!exists) throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');

        const { alreadyLiked } = await this.likePort.like(postId, userId, userModel);
        return { postId, liked: !alreadyLiked };
    }
}
