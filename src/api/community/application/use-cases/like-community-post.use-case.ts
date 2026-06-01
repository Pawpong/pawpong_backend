import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import { NotificationType, RecipientType } from '../../../../common/enum/user.enum';
import { NOTIFICATION_DISPATCH_PORT } from '../../../notification/application/ports/notification-dispatch.port';
import type { NotificationDispatchPort } from '../../../notification/application/ports/notification-dispatch.port';
import { COMMUNITY_AUTHOR_READER_PORT, type CommunityAuthorReaderPort } from '../ports/community-author-reader.port';
import { COMMUNITY_LIKE_PORT, type CommunityLikePort } from '../ports/community-like.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityAuthorModel } from '../types/community-post.type';

@Injectable()
export class LikeCommunityPostUseCase {
    private readonly logger = new Logger(LikeCommunityPostUseCase.name);

    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_LIKE_PORT)
        private readonly likePort: CommunityLikePort,
        @Inject(COMMUNITY_AUTHOR_READER_PORT)
        private readonly authorReader: CommunityAuthorReaderPort,
        @Inject(NOTIFICATION_DISPATCH_PORT)
        private readonly notificationDispatch: NotificationDispatchPort,
    ) {}

    async execute(
        postId: string,
        userId: string,
        userModel: CommunityAuthorModel,
    ): Promise<{ postId: string; liked: boolean }> {
        const exists = await this.reader.existsActivePost(postId);
        if (!exists) throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');

        const { alreadyLiked } = await this.likePort.like(postId, userId, userModel);

        if (!alreadyLiked) {
            this.sendLikeNotification(postId, userId, userModel).catch((err: Error) => {
                this.logger.error(`[execute] 좋아요 알림 발송 실패: ${err.message}`, { postId, userId });
            });
        }

        return { postId, liked: !alreadyLiked };
    }

    private async sendLikeNotification(
        postId: string,
        likerId: string,
        likerModel: CommunityAuthorModel,
    ): Promise<void> {
        const post = await this.reader.readPostById(postId);
        if (!post || post.authorId === likerId) return;

        const likerRole = likerModel === 'Breeder' ? 'breeder' : 'adopter';
        const likerSnapshot = await this.authorReader.readAuthorSnapshot(likerId, likerRole);
        const likerNickname = likerSnapshot?.authorNickname ?? '누군가';

        const authorRole = post.authorModel === 'Breeder' ? 'breeder' : 'adopter';
        const recipientType = authorRole === 'breeder' ? RecipientType.BREEDER : RecipientType.ADOPTER;

        await this.notificationDispatch
            .to(post.authorId, recipientType)
            .type(NotificationType.COMMUNITY_POST_LIKED)
            .title('좋아요를 받았어요!')
            .content(`${likerNickname}님이 내 게시글을 좋아합니다.`)
            .metadata({ likerNickname, postId })
            .targetUrl(`/community/posts/${postId}`)
            .send();
    }
}
