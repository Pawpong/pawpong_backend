import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema';
import { StorageModule } from '../../../common/storage/storage.module';
import { FeedCacheKeyService } from '../domain/services/feed-cache-key.service';
import { FeedVideoSummaryPresentationService } from '../domain/services/feed-video-summary-presentation.service';
import { FEED_LIKE_ASSET_URL_PORT } from './application/ports/feed-like-asset-url.port';
import {
    GET_FEED_VIDEO_LIKE_STATUS_USE_CASE,
    GET_MY_LIKED_FEED_VIDEOS_USE_CASE,
    TOGGLE_FEED_VIDEO_LIKE_USE_CASE,
} from './application/tokens/feed-like-interaction.token';
import { ToggleLikeUseCase } from './application/use-cases/toggle-like.use-case';
import { GetLikeStatusUseCase } from './application/use-cases/get-like-status.use-case';
import { GetMyLikedVideosUseCase } from './application/use-cases/get-my-liked-videos.use-case';
import { FeedLikePolicyService } from './domain/services/feed-like-policy.service';
import { FeedLikePresentationService } from './domain/services/feed-like-presentation.service';
import { FeedLikeMongooseManagerAdapter } from './infrastructure/feed-like-mongoose-manager.adapter';
import { FeedLikeStorageAssetUrlAdapter } from './infrastructure/feed-like-storage-asset-url.adapter';
import { FeedLikeRepository } from './repository/feed-like.repository';
import { FEED_LIKE_MANAGER_PORT } from './application/ports/feed-like-manager.port';

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
        ToggleLikeUseCase,
        GetLikeStatusUseCase,
        GetMyLikedVideosUseCase,
        FeedCacheKeyService,
        FeedVideoSummaryPresentationService,
        FeedLikePolicyService,
        FeedLikePresentationService,
        FeedLikeRepository,
        FeedLikeMongooseManagerAdapter,
        FeedLikeStorageAssetUrlAdapter,
        {
            provide: FEED_LIKE_MANAGER_PORT,
            useExisting: FeedLikeMongooseManagerAdapter,
        },
        {
            provide: FEED_LIKE_ASSET_URL_PORT,
            useExisting: FeedLikeStorageAssetUrlAdapter,
        },
        {
            provide: TOGGLE_FEED_VIDEO_LIKE_USE_CASE,
            useExisting: ToggleLikeUseCase,
        },
        {
            provide: GET_FEED_VIDEO_LIKE_STATUS_USE_CASE,
            useExisting: GetLikeStatusUseCase,
        },
        {
            provide: GET_MY_LIKED_FEED_VIDEOS_USE_CASE,
            useExisting: GetMyLikedVideosUseCase,
        },
    ],
    exports: [TOGGLE_FEED_VIDEO_LIKE_USE_CASE, GET_FEED_VIDEO_LIKE_STATUS_USE_CASE, GET_MY_LIKED_FEED_VIDEOS_USE_CASE],
})
export class FeedLikeModule {}
