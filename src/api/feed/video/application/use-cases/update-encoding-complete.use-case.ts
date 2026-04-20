import { Inject, Injectable } from '@nestjs/common';

import {
    FEED_VIDEO_COMMAND_PORT,
    type FeedVideoCommandPort,
    type FeedVideoEncodingResult,
} from '../ports/feed-video-command.port';

@Injectable()
export class UpdateEncodingCompleteUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND_PORT)
        private readonly feedVideoCommand: FeedVideoCommandPort,
    ) {}

    execute(videoId: string, data: FeedVideoEncodingResult): Promise<void> {
        return this.feedVideoCommand.markEncodingComplete(videoId, data);
    }
}
