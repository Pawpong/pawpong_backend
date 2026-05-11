import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';

import {
    COMMUNITY_POST_READER_PORT,
    type CommunityPostReaderPort,
} from '../ports/community-post-reader.port';
import {
    COMMUNITY_POST_WRITER_PORT,
    type CommunityPostWriterPort,
} from '../ports/community-post-writer.port';

@Injectable()
export class DeleteCommunityPostUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_POST_WRITER_PORT)
        private readonly writer: CommunityPostWriterPort,
    ) {}

    async execute(userId: string, postId: string): Promise<{ deleted: true }> {
        const existing = await this.reader.readPostById(postId);
        if (!existing) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }
        if (existing.authorId !== userId) {
            throw new ForbiddenException('본인 게시글만 삭제할 수 있습니다.');
        }
        await this.writer.softDeleteByAuthor(postId, userId);
        return { deleted: true };
    }
}
