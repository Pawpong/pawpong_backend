import { Injectable } from '@nestjs/common';

import type { CommunityAuthorModel } from '../application/types/community-post.type';
import type { CommunityLikePort } from '../application/ports/community-like.port';
import { CommunityLikeRepository } from '../repository/community-like.repository';

@Injectable()
export class CommunityLikeMongooseAdapter implements CommunityLikePort {
    constructor(private readonly repository: CommunityLikeRepository) {}

    like(postId: string, userId: string, userModel: CommunityAuthorModel): Promise<{ alreadyLiked: boolean }> {
        return this.repository.like(postId, userId, userModel);
    }

    unlike(postId: string, userId: string): Promise<{ wasLiked: boolean }> {
        return this.repository.unlike(postId, userId);
    }

    isLiked(userId: string, postId: string): Promise<boolean> {
        return this.repository.isLiked(userId, postId);
    }

    findLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
        return this.repository.findLikedPostIds(userId, postIds);
    }
}
