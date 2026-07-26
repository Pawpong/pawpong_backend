import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { REDIS_SERVICE_TOKEN } from '../../../../../common/redis/redis.token';
import type { RedisService } from '../../../../../common/redis/redis.module';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import { COMMUNITY_POST_WRITER_PORT, type CommunityPostWriterPort } from '../ports/community-post-writer.port';

/** 같은 사용자가 24시간 내 재조회 시 viewCount 증가를 생략하는 TTL (초) */
const VIEW_DEDUP_TTL_SECONDS = 86400;

@Injectable()
export class IncrementViewCountUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_POST_WRITER_PORT)
        private readonly writer: CommunityPostWriterPort,
        @Inject(REDIS_SERVICE_TOKEN)
        private readonly redis: RedisService,
    ) {}

    async execute(postId: string, userId?: string): Promise<void> {
        const exists = await this.reader.existsActivePost(postId);
        if (!exists) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }

        // 인증된 사용자는 24시간 내 중복 조회를 생략 (Redis TTL dedup)
        if (userId) {
            const key = `community:view:${userId}:${postId}`;
            const alreadyViewed = await this.redis.exists(key);
            if (alreadyViewed) return;

            await this.writer.incrementViewCount(postId);
            await this.redis.set(key, '1', VIEW_DEDUP_TTL_SECONDS);
            return;
        }

        // 비인증 사용자는 항상 증가
        await this.writer.incrementViewCount(postId);
    }
}
