import { MongooseModule } from '@nestjs/mongoose';

import { VideoComment, VideoCommentSchema } from '../../../schema/video-comment.schema';
import { Video, VideoSchema } from '../../../schema/video.schema';
import { FeedCacheKeyService } from '../domain/services/feed-cache-key.service';

import { CREATE_FEED_VIDEO_COMMENT_USE_CASE } from './application/tokens/feed-comment-interaction.token';
import { DELETE_FEED_VIDEO_COMMENT_USE_CASE } from './application/tokens/feed-comment-interaction.token';
import { GET_FEED_VIDEO_COMMENTS_USE_CASE } from './application/tokens/feed-comment-interaction.token';
import { GET_FEED_VIDEO_REPLIES_USE_CASE } from './application/tokens/feed-comment-interaction.token';
import { UPDATE_FEED_VIDEO_COMMENT_USE_CASE } from './application/tokens/feed-comment-interaction.token';
import { FEED_COMMENT_MANAGER_PORT } from './application/ports/feed-comment-manager.port';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { GetCommentsUseCase } from './application/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from './application/use-cases/get-replies.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { FeedCommentCommandResultMapperService } from './domain/services/feed-comment-command-result-mapper.service';
import { FeedCommentPageAssemblerService } from './domain/services/feed-comment-page-assembler.service';
import { FeedCommentPolicyService } from './domain/services/feed-comment-policy.service';
import { FeedCommentMongooseManagerAdapter } from './infrastructure/feed-comment-mongoose-manager.adapter';
import { FeedCommentRepository } from './repository/feed-comment.repository';

const FEED_COMMENT_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Video.name, schema: VideoSchema },
    { name: VideoComment.name, schema: VideoCommentSchema },
]);

export const FEED_COMMENT_MODULE_IMPORTS = [FEED_COMMENT_SCHEMA_IMPORTS];

const FEED_COMMENT_USE_CASE_PROVIDERS = [
    CreateCommentUseCase,
    GetCommentsUseCase,
    GetRepliesUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
];

const FEED_COMMENT_DOMAIN_PROVIDERS = [
    FeedCacheKeyService,
    FeedCommentPolicyService,
    FeedCommentCommandResultMapperService,
    FeedCommentPageAssemblerService,
];

const FEED_COMMENT_INFRASTRUCTURE_PROVIDERS = [FeedCommentRepository, FeedCommentMongooseManagerAdapter];

const FEED_COMMENT_PORT_BINDINGS = [
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
];

export const FEED_COMMENT_MODULE_PROVIDERS = [
    ...FEED_COMMENT_USE_CASE_PROVIDERS,
    ...FEED_COMMENT_DOMAIN_PROVIDERS,
    ...FEED_COMMENT_INFRASTRUCTURE_PROVIDERS,
    ...FEED_COMMENT_PORT_BINDINGS,
];

export const FEED_COMMENT_MODULE_EXPORTS = [
    CREATE_FEED_VIDEO_COMMENT_USE_CASE,
    GET_FEED_VIDEO_COMMENTS_USE_CASE,
    GET_FEED_VIDEO_REPLIES_USE_CASE,
    UPDATE_FEED_VIDEO_COMMENT_USE_CASE,
    DELETE_FEED_VIDEO_COMMENT_USE_CASE,
];
