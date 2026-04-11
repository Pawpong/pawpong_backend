import { Inject, Injectable } from '@nestjs/common';

import { FeedLikePresentationService } from '../../domain/services/feed-like-presentation.service';
import { FEED_LIKE_ASSET_URL_PORT, type FeedLikeAssetUrlPort } from '../ports/feed-like-asset-url.port';
import { FEED_LIKE_MANAGER_PORT, type FeedLikeManagerPort } from '../ports/feed-like-manager.port';

@Injectable()
export class GetMyLikedVideosUseCase {
    constructor(
        @Inject(FEED_LIKE_MANAGER_PORT)
        private readonly feedLikeManager: FeedLikeManagerPort,
        private readonly feedLikePresentationService: FeedLikePresentationService,
        @Inject(FEED_LIKE_ASSET_URL_PORT)
        private readonly feedLikeAssetUrl: FeedLikeAssetUrlPort,
    ) {}

    async execute(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [videos, totalCount] = await Promise.all([
            this.feedLikeManager.readMyLikedVideos(userId, skip, limit),
            this.feedLikeManager.countMyLikedVideos(userId),
        ]);

        return this.feedLikePresentationService.buildMyLikedVideosResponse(
            videos,
            page,
            limit,
            totalCount,
            (fileKey) => (fileKey ? this.feedLikeAssetUrl.generateSignedUrl(fileKey, 50) : null),
        );
    }
}
