import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema';
import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema';
import { VideoEncodingProcessor } from './processors/video-encoding.processor';
import { StorageModule } from '../../../common/storage/storage.module';
import { FeedCommentModule } from '../comment/feed-comment.module';
import { FeedLikeModule } from '../like/feed-like.module';
import { FeedTagModule } from '../tag/feed-tag.module';
import { FeedCacheKeyService } from '../domain/services/feed-cache-key.service';
import { FeedVideoSummaryPresentationService } from '../domain/services/feed-video-summary-presentation.service';
import { FeedVideoTranscoderPort } from './application/ports/feed-video-transcoder.port';
import { FEED_VIDEO_FILE_STORAGE } from './application/ports/feed-video-file-storage.port';
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
import { FeedVideoFfmpegAdapter } from './infrastructure/feed-video-ffmpeg.adapter';
import { FeedVideoMongooseReaderAdapter } from './infrastructure/feed-video-mongoose-reader.adapter';
import { FeedVideoMongooseCommandAdapter } from './infrastructure/feed-video-mongoose-command.adapter';
import { FeedVideoPrefetchPresentationService } from './infrastructure/feed-video-prefetch-presentation.service';
import { FeedVideoStorageAdapter } from './infrastructure/feed-video-storage.adapter';
import { FeedVideoStorageStreamAdapter } from './infrastructure/feed-video-storage-stream.adapter';
import { FeedVideoStreamResponseService } from './infrastructure/feed-video-stream-response.service';
import { FeedVideoRepository } from './repository/feed-video.repository';
import { FEED_VIDEO_READER } from './application/ports/feed-video-reader.port';
import { FEED_VIDEO_COMMAND } from './application/ports/feed-video-command.port';
import { FEED_VIDEO_STREAM } from './application/ports/feed-video-stream.port';
import { FeedVideoDetailController } from './feed-video-detail.controller';
import { FeedVideoHlsStreamController } from './feed-video-hls-stream.controller';
import { FeedVideoListController } from './feed-video-list.controller';
import { FeedVideoPrefetchController } from './feed-video-prefetch.controller';
import { FeedVideoPopularController } from './feed-video-popular.controller';
import { FeedVideoUploadController } from './feed-video-upload.controller';
import { FeedVideoViewController } from './feed-video-view.controller';
import { FeedVideoLibraryController } from './feed-video-library.controller';
import { FeedVideoOwnershipController } from './feed-video-ownership.controller';
import { FeedVideoLikeCommandController } from './feed-video-like-command.controller';
import { FeedVideoLikeStatusController } from './feed-video-like-status.controller';
import { FeedVideoLikedVideosController } from './feed-video-liked-videos.controller';
import { FeedVideoCommentQueryController } from './feed-video-comment-query.controller';
import { FeedVideoCommentCreateController } from './feed-video-comment-create.controller';
import { FeedVideoCommentUpdateController } from './feed-video-comment-update.controller';
import { FeedVideoCommentDeleteController } from './feed-video-comment-delete.controller';
import { FeedVideoTagSearchController } from './feed-video-tag-search.controller';
import { FeedVideoTagCatalogController } from './feed-video-tag-catalog.controller';

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
        FeedVideoListController,
        FeedVideoPopularController,
        FeedVideoDetailController,
        FeedVideoViewController,
        FeedVideoHlsStreamController,
        FeedVideoPrefetchController,
        FeedVideoUploadController,
        FeedVideoLibraryController,
        FeedVideoOwnershipController,
        FeedVideoLikeCommandController,
        FeedVideoLikeStatusController,
        FeedVideoLikedVideosController,
        FeedVideoCommentQueryController,
        FeedVideoCommentCreateController,
        FeedVideoCommentUpdateController,
        FeedVideoCommentDeleteController,
        FeedVideoTagSearchController,
        FeedVideoTagCatalogController,
    ],
    providers: [
        FeedVideoFfmpegAdapter,
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
        FeedCacheKeyService,
        FeedVideoSummaryPresentationService,
        FeedVideoPresentationService,
        FeedVideoCommandPolicyService,
        FeedVideoStreamingService,
        FeedVideoAssetUrlService,
        FeedVideoRepository,
        FeedVideoMongooseReaderAdapter,
        FeedVideoMongooseCommandAdapter,
        FeedVideoPrefetchPresentationService,
        FeedVideoStorageAdapter,
        FeedVideoStorageStreamAdapter,
        FeedVideoStreamResponseService,
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
        {
            provide: FeedVideoTranscoderPort,
            useExisting: FeedVideoFfmpegAdapter,
        },
        {
            provide: FEED_VIDEO_FILE_STORAGE,
            useExisting: FeedVideoStorageAdapter,
        },
    ],
})
export class FeedVideoModule {}
