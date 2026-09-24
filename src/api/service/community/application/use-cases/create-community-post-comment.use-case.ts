import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import { NotificationType, RecipientType } from '../../../../../common/enum/user.enum';
import { NOTIFICATION_TARGET_URL } from '../../../notification/constants/notification-target-url';
import { NOTIFICATION_DISPATCH_PORT } from '../../../notification/application/ports/notification-dispatch.port';
import type { NotificationDispatchPort } from '../../../notification/application/ports/notification-dispatch.port';
import type { NotificationMetadata } from '../../../notification/types/notification-metadata.type';
import { COMMUNITY_AUTHOR_READER_PORT, type CommunityAuthorReaderPort } from '../ports/community-author-reader.port';
import { COMMUNITY_COMMENT_READER_PORT, type CommunityCommentReaderPort } from '../ports/community-comment-reader.port';
import { COMMUNITY_COMMENT_WRITER_PORT, type CommunityCommentWriterPort } from '../ports/community-comment-writer.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityAuthorModel } from '../types/community-post.type';
import type { CommunityAuthorSnapshot } from '../types/community-post-write.type';

interface CommentNotificationParams {
    recipientId: string;
    recipientModel: CommunityAuthorModel;
    type: NotificationType;
    title: string;
    content: string;
    metadata: NotificationMetadata;
    postId: string;
}

@Injectable()
export class CreateCommunityPostCommentUseCase {
    private readonly logger = new Logger(CreateCommunityPostCommentUseCase.name);

    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_AUTHOR_READER_PORT)
        private readonly authorReader: CommunityAuthorReaderPort,
        @Inject(COMMUNITY_COMMENT_READER_PORT)
        private readonly commentReader: CommunityCommentReaderPort,
        @Inject(COMMUNITY_COMMENT_WRITER_PORT)
        private readonly commentWriter: CommunityCommentWriterPort,
        @Inject(NOTIFICATION_DISPATCH_PORT)
        private readonly notificationDispatch: NotificationDispatchPort,
    ) {}

    async execute(
        postId: string,
        userId: string,
        role: 'adopter' | 'breeder',
        command: { body: string; parentCommentId?: string },
    ): Promise<{ commentId: string }> {
        const trimmedBody = command.body.trim();
        if (!trimmedBody) throw new BadRequestException('댓글 내용을 입력해주세요.');

        const exists = await this.reader.existsActivePost(postId);
        if (!exists) throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');

        const author = await this.authorReader.readAuthorSnapshot(userId, role);
        if (!author) throw new BadRequestException('작성자 정보를 찾을 수 없습니다.');

        const result = await this.commentWriter.createComment({
            postId,
            authorId: author.authorId,
            authorModel: author.authorModel,
            authorNickname: author.authorNickname,
            authorProfileImageFileName: author.authorProfileImageFileName,
            body: trimmedBody,
            parentCommentId: command.parentCommentId,
        });

        await this.dispatchCommentNotifications(postId, author, command.parentCommentId).catch((err: Error) => {
            this.logger.error(`[execute] 댓글 알림 발송 실패: ${err.message}`, { postId, userId });
        });

        return result;
    }

    /**
     * 게시글 작성자에게 "댓글" 알림, 대댓글이면 원댓글 작성자에게도 "답글" 알림을 보낸다.
     * 같은 사람이 둘 다 해당하면(원댓글 작성자 = 게시글 작성자) 한 번만 보낸다.
     */
    private async dispatchCommentNotifications(
        postId: string,
        commenter: CommunityAuthorSnapshot,
        parentCommentId?: string,
    ): Promise<void> {
        const post = await this.reader.readPostById(postId);
        if (!post) return;

        const notifiedRecipientIds = new Set<string>([commenter.authorId]);

        if (!notifiedRecipientIds.has(post.authorId)) {
            await this.sendNotification({
                recipientId: post.authorId,
                recipientModel: post.authorModel,
                type: NotificationType.COMMUNITY_POST_COMMENTED,
                title: '댓글이 달렸어요!',
                content: `${commenter.authorNickname}님이 내 게시글에 댓글을 남겼어요.`,
                metadata: { commenterNickname: commenter.authorNickname, postId },
                postId,
            });
            notifiedRecipientIds.add(post.authorId);
        }

        if (!parentCommentId) return;

        const parentComment = await this.commentReader.readCommentById(parentCommentId);
        if (!parentComment || !parentComment.isActive) return;
        if (notifiedRecipientIds.has(parentComment.authorId)) return;

        await this.sendNotification({
            recipientId: parentComment.authorId,
            recipientModel: parentComment.authorModel,
            type: NotificationType.COMMUNITY_COMMENT_REPLIED,
            title: '답글이 달렸어요!',
            content: `${commenter.authorNickname}님이 내 댓글에 답글을 남겼어요.`,
            metadata: { replierNickname: commenter.authorNickname, postId },
            postId,
        });
    }

    private async sendNotification(params: CommentNotificationParams): Promise<void> {
        const recipientRole = params.recipientModel === 'Breeder' ? 'breeder' : 'adopter';
        const recipientType = recipientRole === 'breeder' ? RecipientType.BREEDER : RecipientType.ADOPTER;

        await this.notificationDispatch
            .to(params.recipientId, recipientType)
            .type(params.type)
            .title(params.title)
            .content(params.content)
            .metadata(params.metadata)
            .targetUrl(NOTIFICATION_TARGET_URL.communityPost(params.postId))
            .send();
    }
}
