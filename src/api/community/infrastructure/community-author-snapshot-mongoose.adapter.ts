import { Injectable } from '@nestjs/common';

import type { CommunityAuthorSnapshotPort } from '../application/ports/community-author-snapshot.port';
import { CommunityRepository } from '../repository/community.repository';

@Injectable()
export class CommunityAuthorSnapshotMongooseAdapter implements CommunityAuthorSnapshotPort {
    constructor(private readonly repository: CommunityRepository) {}

    syncAuthorSnapshots(
        authorId: string,
        patch: { nickname?: string; profileImageFileName?: string },
    ): Promise<{ postsModified: number; commentsModified: number }> {
        return this.repository.syncAuthorSnapshots(authorId, patch);
    }
}
