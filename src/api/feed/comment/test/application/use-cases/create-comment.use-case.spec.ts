import { BadRequestException } from '@nestjs/common';

import { CreateCommentUseCase } from '../../../application/use-cases/create-comment.use-case';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';
import { FeedCommentManagerPort } from '../../../application/ports/feed-comment-manager.port';
import { FeedCommentCommandResponseService } from '../../../domain/services/feed-comment-command-response.service';
import { FeedCommentPolicyService } from '../../../domain/services/feed-comment-policy.service';

describe('댓글 생성 유스케이스', () => {
    const createManager = (): FeedCommentManagerPort => ({
        findVideo: jest.fn().mockResolvedValue({ id: 'video-1' }),
        findComment: jest.fn().mockResolvedValue(null),
        createComment: jest.fn().mockResolvedValue({
            id: 'comment-1',
            videoId: 'video-1',
            userId: 'user-1',
            content: 'hello',
            likeCount: 0,
            isDeleted: false,
            createdAt: new Date('2026-04-06T00:00:00.000Z'),
            updatedAt: undefined,
            author: null,
        }),
        incrementVideoCommentCount: jest.fn().mockResolvedValue(undefined),
        readRootComments: jest.fn(),
        countRootComments: jest.fn(),
        readReplyCounts: jest.fn(),
        readReplies: jest.fn(),
        countReplies: jest.fn(),
        updateCommentContent: jest.fn(),
        markDeleted: jest.fn(),
    });

    it('부모 댓글이 다른 동영상에 속하면 예외를 던진다', async () => {
        const manager = createManager();
        manager.findComment = jest.fn().mockResolvedValue({
            id: 'parent-1',
            videoId: 'video-2',
            userId: 'user-2',
            content: 'parent',
            likeCount: 0,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: undefined,
            author: null,
        });

        const useCase = new CreateCommentUseCase(
            manager,
            new FeedCommentPolicyService(),
            new FeedCommentCommandResponseService(),
            { del: jest.fn() } as any,
            new FeedCacheKeyService(),
        );

        await expect(useCase.execute('video-1', 'user-1', 'Adopter', 'reply', 'parent-1')).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });
});
