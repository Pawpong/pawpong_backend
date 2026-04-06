import { Inject, Injectable } from '@nestjs/common';

import { FeedVideoPresentationService } from '../../domain/services/feed-video-presentation.service';
import { FeedVideoAssetUrlService } from '../../infrastructure/feed-video-asset-url.service';
import { FEED_VIDEO_COMMAND, type FeedVideoCommandPort } from '../ports/feed-video-command.port';

@Injectable()
export class GetMyVideosUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        private readonly feedVideoPresentationService: FeedVideoPresentationService,
        private readonly feedVideoAssetUrlService: FeedVideoAssetUrlService,
    ) {}

    async execute(userId: string, page: number = 1, limit: number = 20): Promise<any> {
        const skip = (page - 1) * limit;
        const [videos, totalCount] = await Promise.all([
            this.feedVideoCommand.readMine(userId, skip, limit),
            this.feedVideoCommand.countMine(userId),
        ]);

        return this.feedVideoPresentationService.buildMyVideosResponse(
            videos,
            page,
            limit,
            totalCount,
            (fileKey) => this.feedVideoAssetUrlService.getSignedUrlWithCache(fileKey, 3000),
        );
    }
}
