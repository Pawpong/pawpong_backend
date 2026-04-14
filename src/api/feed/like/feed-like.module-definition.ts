import { MongooseModule } from '@nestjs/mongoose';

import { VideoLike, VideoLikeSchema } from '../../../schema/video-like.schema';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { StorageModule } from '../../../common/storage/storage.module';
import { FeedCacheKeyService } from '../domain/services/feed-cache-key.service';
import { FeedVideoSummaryMapperService } from '../domain/services/feed-video-summary-mapper.service';

import { FEED_LIKE_ASSET_URL_PORT } from './application/ports/feed-like-asset-url.port';
import { FEED_LIKE_MANAGER_PORT } from './application/ports/feed-like-manager.port';
import {
    GET_FEED_VIDEO_LIKE_STATUS_USE_CASE,
    GET_MY_LIKED_FEED_VIDEOS_USE_CASE,
    TOGGLE_FEED_VIDEO_LIKE_USE_CASE,
} from './application/tokens/feed-like-interaction.token';
import { GetLikeStatusUseCase } from './application/use-cases/get-like-status.use-case';
import { GetMyLikedVideosUseCase } from './application/use-cases/get-my-liked-videos.use-case';
import { ToggleLikeUseCase } from './application/use-cases/toggle-like.use-case';
import { FeedLikePolicyService } from './domain/services/feed-like-policy.service';
import { FeedLikeResultMapperService } from './domain/services/feed-like-result-mapper.service';
import { FeedLikeMongooseManagerAdapter } from './infrastructure/feed-like-mongoose-manager.adapter';
import { FeedLikeStorageAssetUrlAdapter } from './infrastructure/feed-like-storage-asset-url.adapter';
import { FeedLikeRepository } from './repository/feed-like.repository';

const FEED_LIKE_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Video.name, schema: VideoSchema },
    { name: VideoLike.name, schema: VideoLikeSchema },
]);

export const FEED_LIKE_MODULE_IMPORTS = [FEED_LIKE_SCHEMA_IMPORTS, StorageModule];

const FEED_LIKE_USE_CASE_PROVIDERS = [ToggleLikeUseCase, GetLikeStatusUseCase, GetMyLikedVideosUseCase];

const FEED_LIKE_DOMAIN_PROVIDERS = [
    FeedCacheKeyService,
    FeedVideoSummaryMapperService,
    FeedLikePolicyService,
    FeedLikeResultMapperService,
];

const FEED_LIKE_INFRASTRUCTURE_PROVIDERS = [
    FeedLikeRepository,
    FeedLikeMongooseManagerAdapter,
    FeedLikeStorageAssetUrlAdapter,
];

const FEED_LIKE_PORT_BINDINGS = [
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
];

export const FEED_LIKE_MODULE_PROVIDERS = [
    ...FEED_LIKE_USE_CASE_PROVIDERS,
    ...FEED_LIKE_DOMAIN_PROVIDERS,
    ...FEED_LIKE_INFRASTRUCTURE_PROVIDERS,
    ...FEED_LIKE_PORT_BINDINGS,
];

export const FEED_LIKE_MODULE_EXPORTS = [
    TOGGLE_FEED_VIDEO_LIKE_USE_CASE,
    GET_FEED_VIDEO_LIKE_STATUS_USE_CASE,
    GET_MY_LIKED_FEED_VIDEOS_USE_CASE,
];
