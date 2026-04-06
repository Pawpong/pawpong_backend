import { Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../../../../../common/storage/storage.service';
import { FeedLikePresentationService } from '../../domain/services/feed-like-presentation.service';
import { FEED_LIKE_MANAGER, type FeedLikeManagerPort } from '../ports/feed-like-manager.port';

@Injectable()
export class GetMyLikedVideosUseCase {
    constructor(
        @Inject(FEED_LIKE_MANAGER)
        private readonly feedLikeManager: FeedLikeManagerPort,
        private readonly feedLikePresentationService: FeedLikePresentationService,
        private readonly storageService: StorageService,
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
            (fileKey) => (fileKey ? this.storageService.generateSignedUrl(fileKey, 50) : null),
        );
    }
}
