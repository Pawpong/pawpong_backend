import { Inject, Injectable } from '@nestjs/common';

import { FeedVideoLibraryAssemblerService } from '../../domain/services/feed-video-library-assembler.service';
import { FeedVideoAssetUrlService } from '../../infrastructure/feed-video-asset-url.service';
import { FEED_VIDEO_COMMAND_PORT, type FeedVideoCommandPort } from '../ports/feed-video-command.port';
import type { FeedMyVideoListResult } from '../types/feed-video-result.type';

@Injectable()
export class GetMyVideosUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND_PORT)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        private readonly feedVideoLibraryAssemblerService: FeedVideoLibraryAssemblerService,
        private readonly feedVideoAssetUrlService: FeedVideoAssetUrlService,
    ) {}

    async execute(userId: string, page: number = 1, limit: number = 20): Promise<FeedMyVideoListResult> {
        const skip = (page - 1) * limit;
        const [videos, totalCount] = await Promise.all([
            this.feedVideoCommand.readMine(userId, skip, limit),
            this.feedVideoCommand.countMine(userId),
        ]);

        return this.feedVideoLibraryAssemblerService.buildMyVideosResult(
            videos,
            page,
            limit,
            totalCount,
            (fileKey) => this.feedVideoAssetUrlService.getSignedUrlWithCache(fileKey, 3000),
        );
    }
}
