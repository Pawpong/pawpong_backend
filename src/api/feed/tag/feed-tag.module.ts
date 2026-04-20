import { Module } from '@nestjs/common';

import {
    FEED_TAG_MODULE_EXPORTS,
    FEED_TAG_MODULE_IMPORTS,
    FEED_TAG_MODULE_PROVIDERS,
} from './feed-tag.module-definition';

/**
 * 피드 태그 모듈
 * - 해시태그 검색
 * - 인기 태그 조회
 * - 태그 자동완성
 */
@Module({
    imports: FEED_TAG_MODULE_IMPORTS,
    providers: FEED_TAG_MODULE_PROVIDERS,
    exports: FEED_TAG_MODULE_EXPORTS,
})
export class FeedTagModule {}
