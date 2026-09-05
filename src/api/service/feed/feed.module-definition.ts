import { FeedCommentModule } from './comment/feed-comment.module';
import { FeedLikeModule } from './like/feed-like.module';
import { FeedTagModule } from './tag/feed-tag.module';
import { FeedVideoModule } from './video/feed-video.module';

export const FEED_MODULE_IMPORTS = [FeedVideoModule, FeedCommentModule, FeedLikeModule, FeedTagModule];

export const FEED_MODULE_EXPORTS = [...FEED_MODULE_IMPORTS];
