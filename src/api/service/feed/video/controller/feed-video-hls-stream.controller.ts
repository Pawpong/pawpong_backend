import { Get, NotFoundException, Param, UseInterceptors } from '@nestjs/common';

import { MongoObjectIdPipe } from '../../../../../common/pipe/mongo-object-id.pipe';
import { ProxyHlsFileUseCase } from '../application/use-cases/proxy-hls-file.use-case';
import { FeedPublicController } from '../decorator/feed-video-controller.decorator';
import { FeedVideoStreamResponseInterceptor } from '../presentation/interceptors/feed-video-stream-response.interceptor';
import { ApiStreamFeedVideoEndpoint } from '../swagger/index';
import { FeedVideoRepository } from '../repository/feed-video.repository';
import { isIosAppRequest } from '../../../../../common/content-rights/app-request-context';

@FeedPublicController()
export class FeedVideoHlsStreamController {
    constructor(
        private readonly proxyHlsFileUseCase: ProxyHlsFileUseCase,
        private readonly videoRepository: FeedVideoRepository,
    ) {}

    @Get('videos/stream/:videoId/:filename')
    @UseInterceptors(FeedVideoStreamResponseInterceptor)
    @ApiStreamFeedVideoEndpoint()
    async streamHLS(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @Param('filename') filename: string,
    ) {
        if (isIosAppRequest() && !(await this.videoRepository.findById(videoId))) {
            throw new NotFoundException('영상을 찾을 수 없습니다.');
        }
        return this.proxyHlsFileUseCase.execute(videoId, filename);
    }
}
