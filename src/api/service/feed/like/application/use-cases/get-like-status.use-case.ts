import { Inject, Injectable } from '@nestjs/common';

import { FeedLikeResultMapperService } from '../../domain/services/feed-like-result-mapper.service';
import { FEED_LIKE_MANAGER_PORT, type FeedLikeManagerPort } from '../ports/feed-like-manager.port';

@Injectable()
export class GetLikeStatusUseCase {
    constructor(
        @Inject(FEED_LIKE_MANAGER_PORT)
        private readonly feedLikeManager: FeedLikeManagerPort,
        private readonly feedLikeResultMapperService: FeedLikeResultMapperService,
    ) {}

    async execute(videoId: string, userId: string) {
        const [video, like] = await Promise.all([
            this.feedLikeManager.findVideoCounter(videoId),
            this.feedLikeManager.findUserLike(videoId, userId),
        ]);

        return this.feedLikeResultMapperService.buildStatusResponse(!!like, video?.likeCount || 0);
    }
}
