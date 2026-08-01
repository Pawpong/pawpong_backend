import { Injectable } from '@nestjs/common';

import type { CommunityBookmarkPort } from '../application/ports/community-bookmark.port';
import type { CommunityAuthorModel } from '../application/types/community-post.type';
import { CommunityBookmarkRepository } from '../repository/community-bookmark.repository';

@Injectable()
export class CommunityBookmarkMongooseAdapter implements CommunityBookmarkPort {
    constructor(private readonly repository: CommunityBookmarkRepository) {}

    save(postId: string, userId: string, userModel: CommunityAuthorModel): Promise<{ alreadySaved: boolean }> {
        return this.repository.save(postId, userId, userModel);
    }

    unsave(postId: string, userId: string): Promise<{ wasSaved: boolean }> {
        return this.repository.unsave(postId, userId);
    }

    listSavedPostIds(userId: string, skip: number, limit: number): Promise<{ postIds: string[]; totalItems: number }> {
        return this.repository.listSavedPostIds(userId, skip, limit);
    }

    findSavedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
        return this.repository.findSavedPostIds(userId, postIds);
    }
}
