import { Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { ProxyHlsFileUseCase } from './application/use-cases/proxy-hls-file.use-case';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { FeedVideoStreamResponseService } from './infrastructure/feed-video-stream-response.service';
import { ApiStreamFeedVideoEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoHlsStreamController {
    constructor(
        private readonly proxyHlsFileUseCase: ProxyHlsFileUseCase,
        private readonly feedVideoStreamResponseService: FeedVideoStreamResponseService,
    ) {}

    @Get('videos/stream/:videoId/:filename')
    @ApiStreamFeedVideoEndpoint()
    async streamHLS(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @Param('filename') filename: string,
        @Res() res: Response,
    ) {
        return this.feedVideoStreamResponseService.sendProxyResponse(res, () =>
            this.proxyHlsFileUseCase.execute(videoId, filename),
        );
    }
}
