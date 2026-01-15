import { Module } from '@nestjs/common';
import { FeedVideoModule } from './video/feed-video.module.js';
import { FeedCommentModule } from './comment/feed-comment.module.js';
import { FeedLikeModule } from './like/feed-like.module.js';
import { FeedTagModule } from './tag/feed-tag.module.js';

/**
 * 피드 도메인 모듈
 * 인스타그램/틱톡 스타일의 피드형 동영상 서비스
 *
 * 구성:
 * - feed-video: 동영상 업로드, 스트리밍, 조회, 인코딩
 * - feed-comment: 댓글, 대댓글
 * - feed-like: 좋아요
 * - feed-tag: 해시태그 검색
 */
@Module({
    imports: [FeedVideoModule, FeedCommentModule, FeedLikeModule, FeedTagModule],
    exports: [FeedVideoModule, FeedCommentModule, FeedLikeModule, FeedTagModule],
})
export class FeedModule {}
