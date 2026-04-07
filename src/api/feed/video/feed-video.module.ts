import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema';
import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema';
import { FfmpegService } from './services/ffmpeg.service';
import { VideoEncodingProcessor } from './processors/video-encoding.processor';
import { StorageModule } from '../../../common/storage/storage.module';
import { FeedCommentModule } from '../comment/feed-comment.module';
import { FeedLikeModule } from '../like/feed-like.module';
import { FeedTagModule } from '../tag/feed-tag.module';
import { GetFeedUseCase } from './application/use-cases/get-feed.use-case';
import { GetPopularVideosUseCase } from './application/use-cases/get-popular-videos.use-case';
import { GetVideoMetaUseCase } from './application/use-cases/get-video-meta.use-case';
import { GetUploadUrlUseCase } from './application/use-cases/get-upload-url.use-case';
import { CompleteUploadUseCase } from './application/use-cases/complete-upload.use-case';
import { GetMyVideosUseCase } from './application/use-cases/get-my-videos.use-case';
import { DeleteVideoUseCase } from './application/use-cases/delete-video.use-case';
import { ToggleVideoVisibilityUseCase } from './application/use-cases/toggle-video-visibility.use-case';
import { IncrementViewCountUseCase } from './application/use-cases/increment-view-count.use-case';
import { UpdateEncodingCompleteUseCase } from './application/use-cases/update-encoding-complete.use-case';
import { UpdateEncodingFailedUseCase } from './application/use-cases/update-encoding-failed.use-case';
import { ProxyHlsFileUseCase } from './application/use-cases/proxy-hls-file.use-case';
import { PrefetchAllQualitySegmentsUseCase } from './application/use-cases/prefetch-all-quality-segments.use-case';
import { FeedVideoPresentationService } from './domain/services/feed-video-presentation.service';
import { FeedVideoCommandPolicyService } from './domain/services/feed-video-command-policy.service';
import { FeedVideoStreamingService } from './domain/services/feed-video-streaming.service';
import { FeedVideoAssetUrlService } from './infrastructure/feed-video-asset-url.service';
import { FeedVideoMongooseReaderAdapter } from './infrastructure/feed-video-mongoose-reader.adapter';
import { FeedVideoMongooseCommandAdapter } from './infrastructure/feed-video-mongoose-command.adapter';
import { FeedVideoStorageStreamAdapter } from './infrastructure/feed-video-storage-stream.adapter';
import { FeedVideoStreamHttpService } from './infrastructure/feed-video-stream-http.service';
import { FEED_VIDEO_READER } from './application/ports/feed-video-reader.port';
import { FEED_VIDEO_COMMAND } from './application/ports/feed-video-command.port';
import { FEED_VIDEO_STREAM } from './application/ports/feed-video-stream.port';
import { FeedVideoFeedController } from './feed-video-feed.controller';
import { FeedVideoMetaController } from './feed-video-meta.controller';
import { FeedVideoHlsStreamController } from './feed-video-hls-stream.controller';
import { FeedVideoPrefetchController } from './feed-video-prefetch.controller';
import { FeedVideoUploadController } from './feed-video-upload.controller';
import { FeedVideoLibraryController } from './feed-video-library.controller';
import { FeedVideoOwnershipController } from './feed-video-ownership.controller';
import { FeedVideoLikeController } from './feed-video-like.controller';
import { FeedVideoCommentQueryController } from './feed-video-comment-query.controller';
import { FeedVideoCommentCommandController } from './feed-video-comment-command.controller';
import { FeedVideoTagController } from './feed-video-tag.controller';

/**
 * 피드 동영상 모듈
 * - 동영상 업로드/조회/삭제
 * - HLS 인코딩 (BullMQ Worker)
 * - Redis 캐싱
 */
@Module({
    imports: [
        // MongoDB 스키마 등록
        MongooseModule.forFeature([
            { name: Video.name, schema: VideoSchema },
            { name: VideoLike.name, schema: VideoLikeSchema },
            { name: VideoComment.name, schema: VideoCommentSchema },
        ]),

        // BullMQ 큐 등록
        BullModule.registerQueue({
            name: 'video',
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 10000, // 10초 대기 후 재시도
                },
            },
        }),

        // 스토리지 모듈
        StorageModule,

        // 서브 모듈들
        FeedCommentModule,
        FeedLikeModule,
        FeedTagModule,
    ],
    controllers: [
        FeedVideoFeedController,
        FeedVideoMetaController,
        FeedVideoHlsStreamController,
        FeedVideoPrefetchController,
        FeedVideoUploadController,
        FeedVideoLibraryController,
        FeedVideoOwnershipController,
        FeedVideoLikeController,
        FeedVideoCommentQueryController,
        FeedVideoCommentCommandController,
        FeedVideoTagController,
    ],
    providers: [
        FfmpegService,
        VideoEncodingProcessor,
        GetFeedUseCase,
        GetPopularVideosUseCase,
        GetVideoMetaUseCase,
        GetUploadUrlUseCase,
        CompleteUploadUseCase,
        GetMyVideosUseCase,
        DeleteVideoUseCase,
        ToggleVideoVisibilityUseCase,
        IncrementViewCountUseCase,
        UpdateEncodingCompleteUseCase,
        UpdateEncodingFailedUseCase,
        ProxyHlsFileUseCase,
        PrefetchAllQualitySegmentsUseCase,
        FeedVideoPresentationService,
        FeedVideoCommandPolicyService,
        FeedVideoStreamingService,
        FeedVideoAssetUrlService,
        FeedVideoMongooseReaderAdapter,
        FeedVideoMongooseCommandAdapter,
        FeedVideoStorageStreamAdapter,
        FeedVideoStreamHttpService,
        {
            provide: FEED_VIDEO_READER,
            useExisting: FeedVideoMongooseReaderAdapter,
        },
        {
            provide: FEED_VIDEO_COMMAND,
            useExisting: FeedVideoMongooseCommandAdapter,
        },
        {
            provide: FEED_VIDEO_STREAM,
            useExisting: FeedVideoStorageStreamAdapter,
        },
    ],
})
export class FeedVideoModule {}
