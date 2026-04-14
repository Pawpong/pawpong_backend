import { Get, Param, UseInterceptors } from '@nestjs/common';

import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { ProxyHlsFileUseCase } from './application/use-cases/proxy-hls-file.use-case';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { FeedVideoStreamResponseInterceptor } from './presentation/interceptors/feed-video-stream-response.interceptor';
import { ApiStreamFeedVideoEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoHlsStreamController {
    constructor(private readonly proxyHlsFileUseCase: ProxyHlsFileUseCase) {}

    @Get('videos/stream/:videoId/:filename')
    @UseInterceptors(FeedVideoStreamResponseInterceptor)
    @ApiStreamFeedVideoEndpoint()
    async streamHLS(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @Param('filename') filename: string,
    ) {
        return this.proxyHlsFileUseCase.execute(videoId, filename);
    }
}
