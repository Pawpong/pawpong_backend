import { Module } from '@nestjs/common';
import {
    FEED_VIDEO_MODULE_CONTROLLERS,
    FEED_VIDEO_MODULE_IMPORTS,
    FEED_VIDEO_MODULE_PROVIDERS,
} from './feed-video.module-definition';

/**
 * 피드 동영상 모듈
 * - 동영상 업로드/조회/삭제
 * - HLS 인코딩 (BullMQ Worker)
 * - Redis 캐싱
 */
@Module({
    imports: FEED_VIDEO_MODULE_IMPORTS,
    controllers: FEED_VIDEO_MODULE_CONTROLLERS,
    providers: FEED_VIDEO_MODULE_PROVIDERS,
})
export class FeedVideoModule {}
