import { Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_BOOKMARK_PORT, type CommunityBookmarkPort } from '../ports/community-bookmark.port';

@Injectable()
export class UnsaveCommunityPostUseCase {
    constructor(
        @Inject(COMMUNITY_BOOKMARK_PORT)
        private readonly bookmark: CommunityBookmarkPort,
    ) {}

    execute(input: { postId: string; userId: string }): Promise<{ wasSaved: boolean }> {
        return this.bookmark.unsave(input.postId, input.userId);
    }
}
