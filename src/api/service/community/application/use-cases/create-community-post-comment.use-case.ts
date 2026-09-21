import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import { NotificationType, RecipientType } from '../../../../../common/enum/user.enum';
import { NOTIFICATION_TARGET_URL } from '../../../notification/constants/notification-target-url';
import { NOTIFICATION_DISPATCH_PORT } from '../../../notification/application/ports/notification-dispatch.port';
import type { NotificationDispatchPort } from '../../../notification/application/ports/notification-dispatch.port';
import { COMMUNITY_AUTHOR_READER_PORT, type CommunityAuthorReaderPort } from '../ports/community-author-reader.port';
import { COMMUNITY_COMMENT_WRITER_PORT, type CommunityCommentWriterPort } from '../ports/community-comment-writer.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityAuthorSnapshot } from '../types/community-post-write.type';

@Injectable()
export class CreateCommunityPostCommentUseCase {
    private readonly logger = new Logger(CreateCommunityPostCommentUseCase.name);

    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_AUTHOR_READER_PORT)
        private readonly authorReader: CommunityAuthorReaderPort,
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

        this.sendCommentNotification(postId, author).catch((err: Error) => {
            this.logger.error(`[execute] 댓글 알림 발송 실패: ${err.message}`, { postId, userId });
        });

        return result;
    }

    private async sendCommentNotification(postId: string, commenter: CommunityAuthorSnapshot): Promise<void> {
        const post = await this.reader.readPostById(postId);
        if (!post || post.authorId === commenter.authorId) return;

        const authorRole = post.authorModel === 'Breeder' ? 'breeder' : 'adopter';
        const recipientType = authorRole === 'breeder' ? RecipientType.BREEDER : RecipientType.ADOPTER;

        await this.notificationDispatch
            .to(post.authorId, recipientType)
            .type(NotificationType.COMMUNITY_POST_COMMENTED)
            .title('댓글이 달렸어요!')
            .content(`${commenter.authorNickname}님이 내 게시글에 댓글을 남겼어요.`)
            .metadata({ commenterNickname: commenter.authorNickname, postId })
            .targetUrl(NOTIFICATION_TARGET_URL.communityPost(postId))
            .send();
    }
}
