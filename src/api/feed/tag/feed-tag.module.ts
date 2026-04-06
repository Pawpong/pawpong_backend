import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { FeedTagService } from './feed-tag.service';
import { StorageModule } from '../../../common/storage/storage.module';
import { SearchByTagUseCase } from './application/use-cases/search-by-tag.use-case';
import { GetPopularTagsUseCase } from './application/use-cases/get-popular-tags.use-case';
import { SuggestTagsUseCase } from './application/use-cases/suggest-tags.use-case';
import { FeedTagQueryService } from './domain/services/feed-tag-query.service';
import { FeedTagPresentationService } from './domain/services/feed-tag-presentation.service';
import { FeedTagMongooseReaderAdapter } from './infrastructure/feed-tag-mongoose-reader.adapter';
import { FEED_TAG_READER } from './application/ports/feed-tag-reader.port';

/**
 * 피드 태그 모듈
 * - 해시태그 검색
 * - 인기 태그 조회
 * - 태그 자동완성
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]), StorageModule],
    providers: [
        FeedTagService,
        SearchByTagUseCase,
        GetPopularTagsUseCase,
        SuggestTagsUseCase,
        FeedTagQueryService,
        FeedTagPresentationService,
        FeedTagMongooseReaderAdapter,
        {
            provide: FEED_TAG_READER,
            useExisting: FeedTagMongooseReaderAdapter,
        },
    ],
    exports: [FeedTagService],
})
export class FeedTagModule {}
