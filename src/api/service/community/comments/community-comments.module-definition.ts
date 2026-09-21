import { NotificationModule } from '../../notification/notification.module';
import { CommunitySharedModule } from '../shared/community-shared.module';
import { CommunityPostCommentController } from '../controller/community-post-comment.controller';
import { GetCommunityPostCommentsUseCase } from '../application/use-cases/get-community-post-comments.use-case';
import { CreateCommunityPostCommentUseCase } from '../application/use-cases/create-community-post-comment.use-case';
import { UpdateCommunityPostCommentUseCase } from '../application/use-cases/update-community-post-comment.use-case';
import { DeleteCommunityPostCommentUseCase } from '../application/use-cases/delete-community-post-comment.use-case';
import { CommunityCommentMongooseAdapter } from '../infrastructure/community-comment-mongoose.adapter';
import { COMMUNITY_COMMENT_READER_PORT } from '../application/ports/community-comment-reader.port';
import { COMMUNITY_COMMENT_WRITER_PORT } from '../application/ports/community-comment-writer.port';

// 커뮤니티 > 댓글 슬라이스 (댓글·답글 작성/수정/삭제/조회)
// 댓글·답글 작성 시 글쓴이·원댓글 작성자에게 알림을 보내므로 NotificationModule(DISPATCH Port)이 필요하다.
export const COMMUNITY_COMMENTS_MODULE_IMPORTS = [CommunitySharedModule, NotificationModule];

export const COMMUNITY_COMMENTS_MODULE_CONTROLLERS = [CommunityPostCommentController];

export const COMMUNITY_COMMENTS_MODULE_PROVIDERS = [
    GetCommunityPostCommentsUseCase,
    CreateCommunityPostCommentUseCase,
    UpdateCommunityPostCommentUseCase,
    DeleteCommunityPostCommentUseCase,
    CommunityCommentMongooseAdapter,
    { provide: COMMUNITY_COMMENT_READER_PORT, useExisting: CommunityCommentMongooseAdapter },
    { provide: COMMUNITY_COMMENT_WRITER_PORT, useExisting: CommunityCommentMongooseAdapter },
];
