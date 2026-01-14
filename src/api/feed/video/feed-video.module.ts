import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Video, VideoSchema } from '../../../schema/video.schema.js';
import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema.js';
import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema.js';
import { FeedVideoController } from './feed-video.controller.js';
import { FeedVideoService } from './services/feed-video.service.js';
import { FfmpegService } from './services/ffmpeg.service.js';
import { VideoEncodingProcessor } from './processors/video-encoding.processor.js';
import { StorageModule } from '../../../common/storage/storage.module.js';
import { FeedCommentModule } from '../comment/feed-comment.module.js';
import { FeedLikeModule } from '../like/feed-like.module.js';
import { FeedTagModule } from '../tag/feed-tag.module.js';

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
    providers: [FeedVideoService, FfmpegService, VideoEncodingProcessor],
    exports: [FeedVideoService],
})
export class FeedVideoModule {}
