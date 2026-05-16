import { Injectable } from '@nestjs/common';

import type { CommunityPostWriterPort } from '../application/ports/community-post-writer.port';
import type {
    CommunityPostCreatePersistData,
    CommunityPostUpdateCommand,
} from '../application/types/community-post-write.type';
import { CommunityRepository } from '../repository/community.repository';

@Injectable()
export class CommunityPostWriterMongooseAdapter implements CommunityPostWriterPort {
    constructor(private readonly repository: CommunityRepository) {}

    async create(data: CommunityPostCreatePersistData): Promise<{ postId: string }> {
        const { _id } = await this.repository.createPost(data);
        return { postId: _id };
    }

    updateByAuthor(postId: string, authorId: string, patch: CommunityPostUpdateCommand): Promise<{ changed: boolean }> {
        return this.repository.updatePostByAuthor(postId, authorId, patch);
    }

    softDeleteByAuthor(postId: string, authorId: string): Promise<{ changed: boolean }> {
        return this.repository.softDeletePostByAuthor(postId, authorId);
    }
}
