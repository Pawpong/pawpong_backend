import { Logger } from '@nestjs/common';
import { CreateCommunityPostCommentUseCase } from '../../../application/use-cases/create-community-post-comment.use-case';
import { LikeCommunityPostUseCase } from '../../../application/use-cases/like-community-post.use-case';
import type { CommunityPostReaderPort } from '../../../application/ports/community-post-reader.port';
import type { CommunityCommentWriterPort } from '../../../application/ports/community-comment-writer.port';
import type { CommunityLikePort } from '../../../application/ports/community-like.port';
import type { NotificationDispatchPort } from '../../../../notification/application/ports/notification-dispatch.port';
import { NotificationBuilder } from '../../../../notification/builder/notification.builder';
import type { NotificationItemResult } from '../../../../notification/application/types/notification-result.type';
import { NotificationType, RecipientType } from '../../../../../../common/enum/user.enum';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
}

/** 작성자의 닉네임을 복사하는 알림 DB 저장도 HTTP 쓰기 작업의 생명주기에 포함한다. */
describe('community notification persistence completion', () => {
    it.each(['comment', 'like'] as const)(
        '%s waits for notification persistence before ending its mutation',
        async (kind) => {
            const { execute, notificationStarted, stored, persisted } = setup(kind);
            let completed = false;
            const result = execute().then(() => {
                completed = true;
            });
            await notificationStarted.promise;
            await new Promise<void>((resolve) => setImmediate(resolve));
            expect(completed).toBe(false);
            stored.resolve(persisted);
            await result;
            expect(completed).toBe(true);
        },
    );

    it.each(['comment', 'like'] as const)(
        '%s keeps the original success behavior when notification persistence fails',
        async (kind) => {
            const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
            try {
                const { execute, notificationStarted, stored } = setup(kind);
                const result = execute();
                await notificationStarted.promise;
                stored.reject(new Error('synthetic notification failure'));
                await expect(result).resolves.toEqual(
                    kind === 'comment' ? { commentId: 'comment' } : { postId: 'post', liked: true },
                );
                expect(logger).toHaveBeenCalledTimes(1);
            } finally {
                logger.mockRestore();
            }
        },
    );
});

function setup(kind: 'comment' | 'like') {
    const notificationStarted = deferred<void>();
    const stored = deferred<NotificationItemResult>();
    const persisted: NotificationItemResult = {
        notificationId: 'notification',
        type: NotificationType.COMMUNITY_POST_COMMENTED,
        title: 'title',
        body: 'body',
        isRead: false,
        createdAt: new Date(),
    };
    const builder = new NotificationBuilder(
        () => {
            notificationStarted.resolve();
            return stored.promise;
        },
        () => false,
        () => undefined,
        'recipient',
        RecipientType.ADOPTER,
    );
    const dispatch = { to: () => builder } as unknown as NotificationDispatchPort;
    const reader = {
        existsActivePost: () => Promise.resolve(true),
        readPostById: () => Promise.resolve({ authorId: 'recipient', authorModel: 'Adopter' }),
    } as unknown as CommunityPostReaderPort;
    const authorReader = {
        readAuthorSnapshot: () =>
            Promise.resolve({ authorId: 'author', authorModel: 'Adopter' as const, authorNickname: 'author nickname' }),
    };
    const comments = new CreateCommunityPostCommentUseCase(
        reader,
        authorReader,
        { readCommentById: () => Promise.resolve(null) },
        { createComment: () => Promise.resolve({ commentId: 'comment' }) } as unknown as CommunityCommentWriterPort,
        dispatch,
    );
    const likes = new LikeCommunityPostUseCase(
        reader,
        { like: () => Promise.resolve({ alreadyLiked: false }) } as unknown as CommunityLikePort,
        authorReader,
        dispatch,
    );
    return {
        execute: () =>
            kind === 'comment'
                ? comments.execute('post', 'author', 'adopter', { body: 'body' })
                : likes.execute('post', 'author', 'Adopter'),
        notificationStarted,
        stored,
        persisted,
    };
}
