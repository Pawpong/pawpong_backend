import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { UpdateCommentUseCase } from '../../../application/use-cases/update-comment.use-case';
import { FeedCommentPolicyService } from '../../../domain/services/feed-comment-policy.service';
import { FeedCommentCommandResultMapperService } from '../../../domain/services/feed-comment-command-result-mapper.service';
import { FeedCommentManagerPort, FeedCommentSnapshot } from '../../../application/ports/feed-comment-manager.port';

const existingComment: FeedCommentSnapshot = {
    id: 'comment-1',
    videoId: 'video-1',
    userId: 'user-1',
    content: '원본 댓글',
    likeCount: 0,
    isDeleted: false,
    createdAt: new Date(),
    author: null,
};

function makeManager(comment: FeedCommentSnapshot | null = existingComment, updated: FeedCommentSnapshot | null = { ...existingComment, content: '수정된 댓글' }): FeedCommentManagerPort {
    return {
        findVideo: jest.fn(),
        findComment: jest.fn().mockResolvedValue(comment),
        createComment: jest.fn(),
        incrementVideoCommentCount: jest.fn(),
        readRootComments: jest.fn(),
        countRootComments: jest.fn(),
        readReplyCounts: jest.fn(),
        readReplies: jest.fn(),
        countReplies: jest.fn(),
        updateCommentContent: jest.fn().mockResolvedValue(updated),
        markDeleted: jest.fn(),
    };
}

describe('댓글 수정 유스케이스', () => {
    const policy = new FeedCommentPolicyService();
    const resultMapper = new FeedCommentCommandResultMapperService();

    it('본인 댓글을 수정하면 결과를 반환한다', async () => {
        const useCase = new UpdateCommentUseCase(makeManager(), policy, resultMapper);

        const result = await useCase.execute('comment-1', 'user-1', '수정된 댓글');

        expect(result.content).toBe('수정된 댓글');
    });

    it('댓글이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new UpdateCommentUseCase(makeManager(null), policy, resultMapper);

        await expect(useCase.execute('not-found', 'user-1', '수정')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('다른 사용자의 댓글은 DomainValidationError를 던진다', async () => {
        const useCase = new UpdateCommentUseCase(makeManager(), policy, resultMapper);

        await expect(useCase.execute('comment-1', 'other-user', '수정')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
