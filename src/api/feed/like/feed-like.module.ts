import { Module } from '@nestjs/common';

import {
    FEED_LIKE_MODULE_EXPORTS,
    FEED_LIKE_MODULE_IMPORTS,
    FEED_LIKE_MODULE_PROVIDERS,
} from './feed-like.module-definition';

/**
 * 피드 좋아요 모듈
 * - 좋아요 토글
 * - 좋아요 상태 확인
 * - 좋아요한 동영상 목록
 */
@Module({
    imports: FEED_LIKE_MODULE_IMPORTS,
    providers: FEED_LIKE_MODULE_PROVIDERS,
    exports: FEED_LIKE_MODULE_EXPORTS,
})
export class FeedLikeModule {}
