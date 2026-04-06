import { BadRequestException } from '@nestjs/common';

import { CreateCommentUseCase } from './create-comment.use-case';
import { FeedCommentManagerPort } from '../ports/feed-comment-manager.port';
import { FeedCommentPolicyService } from '../../domain/services/feed-comment-policy.service';
import { FeedCommentPresentationService } from '../../domain/services/feed-comment-presentation.service';

describe('CreateCommentUseCase', () => {
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
            new FeedCommentPresentationService(),
            { del: jest.fn() } as any,
        );

        await expect(useCase.execute('video-1', 'user-1', 'Adopter', 'reply', 'parent-1')).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });
});
