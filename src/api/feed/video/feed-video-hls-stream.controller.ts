import { Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { FeedVideoStreamHttpService } from './infrastructure/feed-video-stream-http.service';
import { ApiStreamFeedVideoEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoHlsStreamController {
    constructor(private readonly feedVideoStreamHttpService: FeedVideoStreamHttpService) {}

    @Get('videos/stream/:videoId/:filename')
    @ApiStreamFeedVideoEndpoint()
    async streamHLS(@Param('videoId') videoId: string, @Param('filename') filename: string, @Res() res: Response) {
        return this.feedVideoStreamHttpService.stream(videoId, filename, res);
    }
}
