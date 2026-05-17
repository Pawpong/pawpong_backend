import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_BOOKMARK_PORT, type CommunityBookmarkPort } from '../ports/community-bookmark.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityAuthorModel } from '../types/community-post.type';

@Injectable()
export class SaveCommunityPostUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_BOOKMARK_PORT)
        private readonly bookmark: CommunityBookmarkPort,
    ) {}

    async execute(input: {
        postId: string;
        userId: string;
        userModel: CommunityAuthorModel;
    }): Promise<{ alreadySaved: boolean }> {
        const exists = await this.reader.existsActivePost(input.postId);
        if (!exists) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }

        return this.bookmark.save(input.postId, input.userId, input.userModel);
    }
}
