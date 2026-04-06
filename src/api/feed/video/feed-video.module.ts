import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema';
import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema';
import { FeedVideoController } from './feed-video.controller';
import { FeedVideoService } from './services/feed-video.service';
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
import { FeedVideoPresentationService } from './domain/services/feed-video-presentation.service';
import { FeedVideoCommandPolicyService } from './domain/services/feed-video-command-policy.service';
import { FeedVideoAssetUrlService } from './infrastructure/feed-video-asset-url.service';
import { FeedVideoMongooseReaderAdapter } from './infrastructure/feed-video-mongoose-reader.adapter';
import { FeedVideoMongooseCommandAdapter } from './infrastructure/feed-video-mongoose-command.adapter';
import { FEED_VIDEO_READER } from './application/ports/feed-video-reader.port';
import { FEED_VIDEO_COMMAND } from './application/ports/feed-video-command.port';

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
    controllers: [FeedVideoController],
    providers: [
        FeedVideoService,
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
        FeedVideoPresentationService,
        FeedVideoCommandPolicyService,
        FeedVideoAssetUrlService,
        FeedVideoMongooseReaderAdapter,
        FeedVideoMongooseCommandAdapter,
        {
            provide: FEED_VIDEO_READER,
            useExisting: FeedVideoMongooseReaderAdapter,
        },
        {
            provide: FEED_VIDEO_COMMAND,
            useExisting: FeedVideoMongooseCommandAdapter,
        },
    ],
    exports: [FeedVideoService],
})
export class FeedVideoModule {}
