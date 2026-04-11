import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema';
import { FeedCacheKeyService } from '../domain/services/feed-cache-key.service';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { GetCommentsUseCase } from './application/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from './application/use-cases/get-replies.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import {
    CREATE_FEED_VIDEO_COMMENT_USE_CASE,
    DELETE_FEED_VIDEO_COMMENT_USE_CASE,
    GET_FEED_VIDEO_COMMENTS_USE_CASE,
    GET_FEED_VIDEO_REPLIES_USE_CASE,
    UPDATE_FEED_VIDEO_COMMENT_USE_CASE,
} from './application/ports/feed-comment-interaction.port';
import { FeedCommentCommandResponseService } from './domain/services/feed-comment-command-response.service';
import { FeedCommentListPresentationService } from './domain/services/feed-comment-list-presentation.service';
import { FeedCommentPolicyService } from './domain/services/feed-comment-policy.service';
import { FeedCommentMongooseManagerAdapter } from './infrastructure/feed-comment-mongoose-manager.adapter';
import { FeedCommentRepository } from './repository/feed-comment.repository';
import { FEED_COMMENT_MANAGER_PORT } from './application/ports/feed-comment-manager.port';

/**
 * 피드 댓글 모듈
 * - 댓글 작성/수정/삭제
 * - 대댓글 기능
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Video.name, schema: VideoSchema },
            { name: VideoComment.name, schema: VideoCommentSchema },
        ]),
    ],
    providers: [
        CreateCommentUseCase,
        GetCommentsUseCase,
        GetRepliesUseCase,
        UpdateCommentUseCase,
        DeleteCommentUseCase,
        FeedCacheKeyService,
        FeedCommentPolicyService,
        FeedCommentCommandResponseService,
        FeedCommentListPresentationService,
        FeedCommentRepository,
        FeedCommentMongooseManagerAdapter,
        {
            provide: FEED_COMMENT_MANAGER_PORT,
            useExisting: FeedCommentMongooseManagerAdapter,
        },
        {
            provide: CREATE_FEED_VIDEO_COMMENT_USE_CASE,
            useExisting: CreateCommentUseCase,
        },
        {
            provide: GET_FEED_VIDEO_COMMENTS_USE_CASE,
            useExisting: GetCommentsUseCase,
        },
        {
            provide: GET_FEED_VIDEO_REPLIES_USE_CASE,
            useExisting: GetRepliesUseCase,
        },
        {
            provide: UPDATE_FEED_VIDEO_COMMENT_USE_CASE,
            useExisting: UpdateCommentUseCase,
        },
        {
            provide: DELETE_FEED_VIDEO_COMMENT_USE_CASE,
            useExisting: DeleteCommentUseCase,
        },
    ],
    exports: [
        CREATE_FEED_VIDEO_COMMENT_USE_CASE,
        GET_FEED_VIDEO_COMMENTS_USE_CASE,
        GET_FEED_VIDEO_REPLIES_USE_CASE,
        UPDATE_FEED_VIDEO_COMMENT_USE_CASE,
        DELETE_FEED_VIDEO_COMMENT_USE_CASE,
    ],
})
export class FeedCommentModule {}
