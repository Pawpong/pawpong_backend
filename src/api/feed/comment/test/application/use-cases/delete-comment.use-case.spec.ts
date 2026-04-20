import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { DeleteCommentUseCase } from '../../../application/use-cases/delete-comment.use-case';
import { FeedCommentPolicyService } from '../../../domain/services/feed-comment-policy.service';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';
import { FeedCommentManagerPort, FeedCommentSnapshot } from '../../../application/ports/feed-comment-manager.port';

const existingComment: FeedCommentSnapshot = {
    id: 'comment-1',
    videoId: 'video-1',
    userId: 'user-1',
    content: '댓글 내용',
    likeCount: 0,
    isDeleted: false,
    createdAt: new Date(),
    author: null,
};

function makeManager(comment: FeedCommentSnapshot | null = existingComment): FeedCommentManagerPort {
    return {
        findVideo: jest.fn(),
        findComment: jest.fn().mockResolvedValue(comment),
        createComment: jest.fn(),
        incrementVideoCommentCount: jest.fn().mockResolvedValue(undefined),
        readRootComments: jest.fn(),
        countRootComments: jest.fn(),
        readReplyCounts: jest.fn(),
        readReplies: jest.fn(),
        countReplies: jest.fn(),
        updateCommentContent: jest.fn(),
        markDeleted: jest.fn().mockResolvedValue(existingComment),
    };
}

function makeCache() {
    return { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
}

describe('댓글 삭제 유스케이스', () => {
    const policy = new FeedCommentPolicyService();
    const cacheKeyService = new FeedCacheKeyService();

    it('본인 댓글을 삭제하면 성공 결과를 반환한다', async () => {
        const useCase = new DeleteCommentUseCase(makeManager(), policy, makeCache() as any, cacheKeyService);

        const result = await useCase.execute('comment-1', 'user-1');

        expect(result.success).toBe(true);
    });

    it('댓글이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new DeleteCommentUseCase(makeManager(null), policy, makeCache() as any, cacheKeyService);

        await expect(useCase.execute('not-found', 'user-1')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('다른 사용자의 댓글은 DomainValidationError를 던진다', async () => {
        const useCase = new DeleteCommentUseCase(makeManager(), policy, makeCache() as any, cacheKeyService);

        await expect(useCase.execute('comment-1', 'other-user')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
