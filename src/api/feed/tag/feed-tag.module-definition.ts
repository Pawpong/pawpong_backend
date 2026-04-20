import { MongooseModule } from '@nestjs/mongoose';

import { Video, VideoSchema } from '../../../schema/video.schema';
import { StorageModule } from '../../../common/storage/storage.module';
import { FeedCacheKeyService } from '../domain/services/feed-cache-key.service';
import { FeedVideoSummaryMapperService } from '../domain/services/feed-video-summary-mapper.service';

import { FEED_TAG_ASSET_URL_PORT } from './application/ports/feed-tag-asset-url.port';
import { FEED_TAG_READER_PORT } from './application/ports/feed-tag-reader.port';
import {
    GET_POPULAR_FEED_TAGS_USE_CASE,
    SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE,
    SUGGEST_FEED_TAGS_USE_CASE,
} from './application/tokens/feed-tag-interaction.token';
import { GetPopularTagsUseCase } from './application/use-cases/get-popular-tags.use-case';
import { SearchByTagUseCase } from './application/use-cases/search-by-tag.use-case';
import { SuggestTagsUseCase } from './application/use-cases/suggest-tags.use-case';
import { FeedTagNormalizerService } from './domain/services/feed-tag-normalizer.service';
import { FeedTagSearchResultAssemblerService } from './domain/services/feed-tag-search-result-assembler.service';
import { FeedTagMongooseReaderAdapter } from './infrastructure/feed-tag-mongoose-reader.adapter';
import { FeedTagStorageAssetUrlAdapter } from './infrastructure/feed-tag-storage-asset-url.adapter';
import { FeedTagRepository } from './repository/feed-tag.repository';

const FEED_TAG_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]);

export const FEED_TAG_MODULE_IMPORTS = [FEED_TAG_SCHEMA_IMPORTS, StorageModule];

const FEED_TAG_USE_CASE_PROVIDERS = [SearchByTagUseCase, GetPopularTagsUseCase, SuggestTagsUseCase];

const FEED_TAG_DOMAIN_PROVIDERS = [
    FeedCacheKeyService,
    FeedVideoSummaryMapperService,
    FeedTagNormalizerService,
    FeedTagSearchResultAssemblerService,
];

const FEED_TAG_INFRASTRUCTURE_PROVIDERS = [
    FeedTagRepository,
    FeedTagMongooseReaderAdapter,
    FeedTagStorageAssetUrlAdapter,
];

const FEED_TAG_PORT_BINDINGS = [
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
];

export const FEED_TAG_MODULE_PROVIDERS = [
    ...FEED_TAG_USE_CASE_PROVIDERS,
    ...FEED_TAG_DOMAIN_PROVIDERS,
    ...FEED_TAG_INFRASTRUCTURE_PROVIDERS,
    ...FEED_TAG_PORT_BINDINGS,
];

export const FEED_TAG_MODULE_EXPORTS = [
    SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE,
    GET_POPULAR_FEED_TAGS_USE_CASE,
    SUGGEST_FEED_TAGS_USE_CASE,
];
