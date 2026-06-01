import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import { COMMUNITY_POST_WRITER_PORT, type CommunityPostWriterPort } from '../ports/community-post-writer.port';

@Injectable()
export class IncrementViewCountUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_POST_WRITER_PORT)
        private readonly writer: CommunityPostWriterPort,
    ) {}

    async execute(postId: string): Promise<void> {
        const exists = await this.reader.existsActivePost(postId);
        if (!exists) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }
        await this.writer.incrementViewCount(postId);
    }
}
