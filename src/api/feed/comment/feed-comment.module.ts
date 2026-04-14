import { Module } from '@nestjs/common';

import {
    FEED_COMMENT_MODULE_EXPORTS,
    FEED_COMMENT_MODULE_IMPORTS,
    FEED_COMMENT_MODULE_PROVIDERS,
} from './feed-comment.module-definition';

/**
 * 피드 댓글 모듈
 * - 댓글 작성/수정/삭제
 * - 대댓글 기능
 */
@Module({
    imports: FEED_COMMENT_MODULE_IMPORTS,
    providers: FEED_COMMENT_MODULE_PROVIDERS,
    exports: FEED_COMMENT_MODULE_EXPORTS,
})
export class FeedCommentModule {}
