import { GetRepliesUseCase } from '../../../application/use-cases/get-replies.use-case';
import { FeedCommentPageAssemblerService } from '../../../domain/services/feed-comment-page-assembler.service';
import { FeedCommentManagerPort, FeedCommentSnapshot } from '../../../application/ports/feed-comment-manager.port';

function makeReplySnapshot(overrides: Partial<FeedCommentSnapshot> = {}): FeedCommentSnapshot {
    return {
        id: 'reply-1',
        videoId: 'video-1',
        userId: 'user-2',
        content: '대댓글',
        parentId: 'comment-1',
        likeCount: 0,
        isDeleted: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        author: null,
        ...overrides,
    };
}

function makeManager(replies: FeedCommentSnapshot[] = [], total = 0): FeedCommentManagerPort {
    return {
        findVideo: jest.fn(),
        findComment: jest.fn(),
        createComment: jest.fn(),
        incrementVideoCommentCount: jest.fn(),
        readRootComments: jest.fn(),
        countRootComments: jest.fn(),
        readReplyCounts: jest.fn(),
        readReplies: jest.fn().mockResolvedValue(replies),
        countReplies: jest.fn().mockResolvedValue(total),
        updateCommentContent: jest.fn(),
        markDeleted: jest.fn(),
    };
}

describe('대댓글 목록 조회 유스케이스', () => {
    const pageAssembler = new FeedCommentPageAssemblerService();

    it('댓글의 대댓글 목록을 반환한다', async () => {
        const useCase = new GetRepliesUseCase(makeManager([makeReplySnapshot()], 1), pageAssembler);

        const result = await useCase.execute('comment-1');

        expect(result.replies).toHaveLength(1);
    });

    it('대댓글이 없으면 빈 목록을 반환한다', async () => {
        const useCase = new GetRepliesUseCase(makeManager([], 0), pageAssembler);

        const result = await useCase.execute('comment-1');

        expect(result.replies).toEqual([]);
    });
});
