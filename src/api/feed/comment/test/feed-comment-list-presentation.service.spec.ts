import { FeedCommentListPresentationService } from '../domain/services/feed-comment-list-presentation.service';

describe('피드 댓글 목록 응답 서비스', () => {
    const service = new FeedCommentListPresentationService();

    it('댓글 목록 응답에 작성자와 대댓글 수를 조립한다', () => {
        const result = service.buildCommentListResponse(
            [
                {
                    id: 'comment-1',
                    videoId: 'video-1',
                    userId: 'user-1',
                    content: '댓글 내용',
                    likeCount: 3,
                    isDeleted: false,
                    createdAt: new Date('2026-04-09T00:00:00.000Z'),
                    updatedAt: undefined,
                    author: {
                        id: 'user-1',
                        name: '작성자',
                        profileImageFileName: 'profile.jpg',
                        businessName: '테스트 브리더',
                    },
                },
            ],
            1,
            1,
            20,
            [{ commentId: 'comment-1', count: 2 }],
            'user-1',
        );

        expect(result).toEqual({
            comments: [
                {
                    commentId: 'comment-1',
                    content: '댓글 내용',
                    author: {
                        _id: 'user-1',
                        name: '작성자',
                        profileImageFileName: 'profile.jpg',
                        businessName: '테스트 브리더',
                    },
                    likeCount: 3,
                    replyCount: 2,
                    createdAt: new Date('2026-04-09T00:00:00.000Z'),
                    isOwner: true,
                },
            ],
            totalCount: 1,
            hasNextPage: false,
        });
    });

    it('대댓글 목록 응답을 조립한다', () => {
        const result = service.buildReplyListResponse(
            [
                {
                    id: 'reply-1',
                    videoId: 'video-1',
                    userId: 'user-2',
                    content: '대댓글 내용',
                    likeCount: 1,
                    isDeleted: false,
                    createdAt: new Date('2026-04-09T00:00:00.000Z'),
                    updatedAt: undefined,
                    author: null,
                },
            ],
            1,
            1,
            20,
            'user-1',
        );

        expect(result).toEqual({
            replies: [
                {
                    commentId: 'reply-1',
                    content: '대댓글 내용',
                    author: null,
                    likeCount: 1,
                    createdAt: new Date('2026-04-09T00:00:00.000Z'),
                    isOwner: false,
                },
            ],
            totalCount: 1,
            hasNextPage: false,
        });
    });
});
