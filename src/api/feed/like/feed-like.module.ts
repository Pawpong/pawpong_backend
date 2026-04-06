import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema';
import { FeedLikeService } from './feed-like.service';
import { StorageModule } from '../../../common/storage/storage.module';
import { ToggleLikeUseCase } from './application/use-cases/toggle-like.use-case';
import { GetLikeStatusUseCase } from './application/use-cases/get-like-status.use-case';
import { GetMyLikedVideosUseCase } from './application/use-cases/get-my-liked-videos.use-case';
import { FeedLikePolicyService } from './domain/services/feed-like-policy.service';
import { FeedLikePresentationService } from './domain/services/feed-like-presentation.service';
import { FeedLikeMongooseManagerAdapter } from './infrastructure/feed-like-mongoose-manager.adapter';
import { FEED_LIKE_MANAGER } from './application/ports/feed-like-manager.port';

/**
 * 피드 좋아요 모듈
 * - 좋아요 토글
 * - 좋아요 상태 확인
 * - 좋아요한 동영상 목록
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Video.name, schema: VideoSchema },
            { name: VideoLike.name, schema: VideoLikeSchema },
        ]),
        StorageModule,
    ],
    providers: [
        FeedLikeService,
        ToggleLikeUseCase,
        GetLikeStatusUseCase,
        GetMyLikedVideosUseCase,
        FeedLikePolicyService,
        FeedLikePresentationService,
        FeedLikeMongooseManagerAdapter,
        {
            provide: FEED_LIKE_MANAGER,
            useExisting: FeedLikeMongooseManagerAdapter,
        },
    ],
    exports: [FeedLikeService],
})
export class FeedLikeModule {}
