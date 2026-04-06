import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema';
import { FeedCommentService } from './feed-comment.service';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { GetCommentsUseCase } from './application/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from './application/use-cases/get-replies.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { FeedCommentPolicyService } from './domain/services/feed-comment-policy.service';
import { FeedCommentPresentationService } from './domain/services/feed-comment-presentation.service';
import { FeedCommentMongooseManagerAdapter } from './infrastructure/feed-comment-mongoose-manager.adapter';
import { FEED_COMMENT_MANAGER } from './application/ports/feed-comment-manager.port';

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
        FeedCommentService,
        CreateCommentUseCase,
        GetCommentsUseCase,
        GetRepliesUseCase,
        UpdateCommentUseCase,
        DeleteCommentUseCase,
        FeedCommentPolicyService,
        FeedCommentPresentationService,
        FeedCommentMongooseManagerAdapter,
        {
            provide: FEED_COMMENT_MANAGER,
            useExisting: FeedCommentMongooseManagerAdapter,
        },
    ],
    exports: [FeedCommentService],
})
export class FeedCommentModule {}
