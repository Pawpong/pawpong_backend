import { GetCommentsUseCase } from '../../../application/use-cases/get-comments.use-case';
import { FeedCommentPageAssemblerService } from '../../../domain/services/feed-comment-page-assembler.service';
import { FeedCommentManagerPort, FeedCommentSnapshot } from '../../../application/ports/feed-comment-manager.port';

function makeCommentSnapshot(overrides: Partial<FeedCommentSnapshot> = {}): FeedCommentSnapshot {
    return {
        id: 'comment-1',
        videoId: 'video-1',
        userId: 'user-1',
        content: '댓글 내용',
        likeCount: 0,
        isDeleted: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        author: null,
        ...overrides,
    };
}

function makeManager(comments: FeedCommentSnapshot[] = [], total = 0): FeedCommentManagerPort {
    return {
        findVideo: jest.fn(),
        findComment: jest.fn(),
        createComment: jest.fn(),
        incrementVideoCommentCount: jest.fn(),
        readRootComments: jest.fn().mockResolvedValue(comments),
        countRootComments: jest.fn().mockResolvedValue(total),
        readReplyCounts: jest.fn().mockResolvedValue([]),
        readReplies: jest.fn(),
        countReplies: jest.fn(),
        updateCommentContent: jest.fn(),
        markDeleted: jest.fn(),
    };
}

describe('댓글 목록 조회 유스케이스', () => {
    const pageAssembler = new FeedCommentPageAssemblerService();

    it('비디오 댓글 목록을 반환한다', async () => {
        const useCase = new GetCommentsUseCase(makeManager([makeCommentSnapshot()], 1), pageAssembler);

        const result = await useCase.execute('video-1');

        expect(result.comments).toHaveLength(1);
    });

    it('댓글이 없으면 빈 목록을 반환한다', async () => {
        const useCase = new GetCommentsUseCase(makeManager([], 0), pageAssembler);

        const result = await useCase.execute('video-1');

        expect(result.comments).toEqual([]);
        expect(result.totalCount).toBe(0);
    });

    it('페이지 파라미터에 따라 올바른 skip 값을 계산한다', async () => {
        const manager = makeManager([], 0);
        const useCase = new GetCommentsUseCase(manager, pageAssembler);

        await useCase.execute('video-1', undefined, 3, 10);

        expect(manager.readRootComments).toHaveBeenCalledWith('video-1', 20, 10);
    });
});
