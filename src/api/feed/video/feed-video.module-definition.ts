import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { Video, VideoSchema } from '../../../schema/video.schema';
import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema';
import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema';
import { StorageModule } from '../../../common/storage/storage.module';
import { FeedCommentModule } from '../comment/feed-comment.module';
import { FeedLikeModule } from '../like/feed-like.module';
import { FeedTagModule } from '../tag/feed-tag.module';
import { VideoEncodingProcessor } from './processors/video-encoding.processor';
import { FeedCacheKeyService } from '../domain/services/feed-cache-key.service';
import { FeedVideoSummaryMapperService } from '../domain/services/feed-video-summary-mapper.service';
import { FEED_VIDEO_ASSET_URL_PORT } from './application/ports/feed-video-asset-url.port';
import { FEED_VIDEO_TRANSCODER_PORT } from './application/ports/feed-video-transcoder.port';
import { FEED_VIDEO_FILE_STORAGE_PORT } from './application/ports/feed-video-file-storage.port';
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
import { FeedVideoLibraryAssemblerService } from './domain/services/feed-video-library-assembler.service';
import { FeedVideoMetaAssemblerService } from './domain/services/feed-video-meta-assembler.service';
import { FeedVideoPublicListAssemblerService } from './domain/services/feed-video-public-list-assembler.service';
import { FeedVideoCommandPolicyService } from './domain/services/feed-video-command-policy.service';
import { FeedVideoStreamingService } from './domain/services/feed-video-streaming.service';
import { FeedVideoAssetUrlService } from './infrastructure/feed-video-asset-url.service';
import { FeedVideoFfmpegAdapter } from './infrastructure/feed-video-ffmpeg.adapter';
import { FeedVideoMongooseReaderAdapter } from './infrastructure/feed-video-mongoose-reader.adapter';
import { FeedVideoMongooseCommandAdapter } from './infrastructure/feed-video-mongoose-command.adapter';
import { FeedVideoStorageAdapter } from './infrastructure/feed-video-storage.adapter';
import { FeedVideoStorageStreamAdapter } from './infrastructure/feed-video-storage-stream.adapter';
import { FeedVideoStreamResponseService } from './presentation/services/feed-video-stream-response.service';
import { FeedVideoRepository } from './repository/feed-video.repository';
import { FEED_VIDEO_READER_PORT } from './application/ports/feed-video-reader.port';
import { FEED_VIDEO_COMMAND_PORT } from './application/ports/feed-video-command.port';
import { FEED_VIDEO_STREAM_PORT } from './application/ports/feed-video-stream.port';
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

const FEED_VIDEO_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Video.name, schema: VideoSchema },
    { name: VideoLike.name, schema: VideoLikeSchema },
    { name: VideoComment.name, schema: VideoCommentSchema },
]);

const FEED_VIDEO_QUEUE_IMPORT = BullModule.registerQueue({
    name: 'video',
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 10000,
        },
    },
});

export const FEED_VIDEO_MODULE_IMPORTS = [
    FEED_VIDEO_SCHEMA_IMPORTS,
    FEED_VIDEO_QUEUE_IMPORT,
    StorageModule,
    FeedCommentModule,
    FeedLikeModule,
    FeedTagModule,
];

export const FEED_VIDEO_MODULE_CONTROLLERS = [
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
];

const FEED_VIDEO_USE_CASE_PROVIDERS = [
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
];

const FEED_VIDEO_DOMAIN_PROVIDERS = [
    FeedCacheKeyService,
    FeedVideoSummaryMapperService,
    FeedVideoPublicListAssemblerService,
    FeedVideoLibraryAssemblerService,
    FeedVideoMetaAssemblerService,
    FeedVideoCommandPolicyService,
    FeedVideoStreamingService,
];

const FEED_VIDEO_INFRASTRUCTURE_PROVIDERS = [
    FeedVideoFfmpegAdapter,
    VideoEncodingProcessor,
    FeedVideoAssetUrlService,
    FeedVideoRepository,
    FeedVideoMongooseReaderAdapter,
    FeedVideoMongooseCommandAdapter,
    FeedVideoStorageAdapter,
    FeedVideoStorageStreamAdapter,
    FeedVideoStreamResponseService,
];

const FEED_VIDEO_PORT_BINDINGS = [
    {
        provide: FEED_VIDEO_READER_PORT,
        useExisting: FeedVideoMongooseReaderAdapter,
    },
    {
        provide: FEED_VIDEO_ASSET_URL_PORT,
        useExisting: FeedVideoAssetUrlService,
    },
    {
        provide: FEED_VIDEO_COMMAND_PORT,
        useExisting: FeedVideoMongooseCommandAdapter,
    },
    {
        provide: FEED_VIDEO_STREAM_PORT,
        useExisting: FeedVideoStorageStreamAdapter,
    },
    {
        provide: FEED_VIDEO_TRANSCODER_PORT,
        useExisting: FeedVideoFfmpegAdapter,
    },
    {
        provide: FEED_VIDEO_FILE_STORAGE_PORT,
        useExisting: FeedVideoStorageAdapter,
    },
];

export const FEED_VIDEO_MODULE_PROVIDERS = [
    ...FEED_VIDEO_USE_CASE_PROVIDERS,
    ...FEED_VIDEO_DOMAIN_PROVIDERS,
    ...FEED_VIDEO_INFRASTRUCTURE_PROVIDERS,
    ...FEED_VIDEO_PORT_BINDINGS,
];
