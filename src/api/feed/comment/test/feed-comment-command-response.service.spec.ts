import { FeedCommentCommandResponseService } from '../domain/services/feed-comment-command-response.service';

describe('피드 댓글 명령 응답 서비스', () => {
    const service = new FeedCommentCommandResponseService();

    it('댓글 생성 응답을 만든다', () => {
        expect(
            service.buildCreateResponse({
                id: 'comment-1',
                videoId: 'video-1',
                userId: 'user-1',
                content: '댓글 내용',
                likeCount: 0,
                isDeleted: false,
                createdAt: new Date('2026-04-09T00:00:00.000Z'),
                updatedAt: undefined,
                author: null,
            }),
        ).toEqual({
            commentId: 'comment-1',
            content: '댓글 내용',
            createdAt: new Date('2026-04-09T00:00:00.000Z'),
        });
    });

    it('댓글 수정 응답을 만든다', () => {
        expect(
            service.buildUpdateResponse({
                id: 'comment-1',
                videoId: 'video-1',
                userId: 'user-1',
                content: '수정된 댓글',
                likeCount: 0,
                isDeleted: false,
                createdAt: new Date('2026-04-09T00:00:00.000Z'),
                updatedAt: new Date('2026-04-09T01:00:00.000Z'),
                author: null,
            }),
        ).toEqual({
            commentId: 'comment-1',
            content: '수정된 댓글',
            updatedAt: new Date('2026-04-09T01:00:00.000Z'),
        });
    });
});
