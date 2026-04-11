import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { StorageModule } from '../../../common/storage/storage.module';
import { FeedCacheKeyService } from '../domain/services/feed-cache-key.service';
import { FeedVideoSummaryPresentationService } from '../domain/services/feed-video-summary-presentation.service';
import { FEED_TAG_ASSET_URL_PORT } from './application/ports/feed-tag-asset-url.port';
import {
    GET_POPULAR_FEED_TAGS_USE_CASE,
    SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE,
    SUGGEST_FEED_TAGS_USE_CASE,
} from './application/ports/feed-tag-interaction.port';
import { SearchByTagUseCase } from './application/use-cases/search-by-tag.use-case';
import { GetPopularTagsUseCase } from './application/use-cases/get-popular-tags.use-case';
import { SuggestTagsUseCase } from './application/use-cases/suggest-tags.use-case';
import { FeedTagQueryService } from './domain/services/feed-tag-query.service';
import { FeedTagPresentationService } from './domain/services/feed-tag-presentation.service';
import { FeedTagMongooseReaderAdapter } from './infrastructure/feed-tag-mongoose-reader.adapter';
import { FeedTagStorageAssetUrlAdapter } from './infrastructure/feed-tag-storage-asset-url.adapter';
import { FeedTagRepository } from './repository/feed-tag.repository';
import { FEED_TAG_READER_PORT } from './application/ports/feed-tag-reader.port';

/**
 * 피드 태그 모듈
 * - 해시태그 검색
 * - 인기 태그 조회
 * - 태그 자동완성
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]), StorageModule],
    providers: [
        SearchByTagUseCase,
        GetPopularTagsUseCase,
        SuggestTagsUseCase,
        FeedCacheKeyService,
        FeedVideoSummaryPresentationService,
        FeedTagQueryService,
        FeedTagPresentationService,
        FeedTagRepository,
        FeedTagMongooseReaderAdapter,
        FeedTagStorageAssetUrlAdapter,
        {
            provide: FEED_TAG_READER_PORT,
            useExisting: FeedTagMongooseReaderAdapter,
        },
        {
            provide: FEED_TAG_ASSET_URL_PORT,
            useExisting: FeedTagStorageAssetUrlAdapter,
        },
        {
            provide: SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE,
            useExisting: SearchByTagUseCase,
        },
        {
            provide: GET_POPULAR_FEED_TAGS_USE_CASE,
            useExisting: GetPopularTagsUseCase,
        },
        {
            provide: SUGGEST_FEED_TAGS_USE_CASE,
            useExisting: SuggestTagsUseCase,
        },
    ],
    exports: [SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE, GET_POPULAR_FEED_TAGS_USE_CASE, SUGGEST_FEED_TAGS_USE_CASE],
})
export class FeedTagModule {}
