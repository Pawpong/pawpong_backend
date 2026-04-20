import { Inject, Injectable } from '@nestjs/common';

import { FEED_VIDEO_COMMAND_PORT, type FeedVideoCommandPort } from '../ports/feed-video-command.port';

@Injectable()
export class UpdateEncodingFailedUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND_PORT)
        private readonly feedVideoCommand: FeedVideoCommandPort,
    ) {}

    execute(videoId: string, reason: string): Promise<void> {
        return this.feedVideoCommand.markEncodingFailed(videoId, reason);
    }
}
