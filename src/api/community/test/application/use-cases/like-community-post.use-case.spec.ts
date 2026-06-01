import { BadRequestException } from '@nestjs/common';

import { LikeCommunityPostUseCase } from '../../../application/use-cases/like-community-post.use-case';
import { UnlikeCommunityPostUseCase } from '../../../application/use-cases/unlike-community-post.use-case';

const reader = {
    existsActivePost: jest.fn(),
    listPosts: jest.fn(),
    readPostById: jest.fn(),
    readPostsByIds: jest.fn(),
    listComments: jest.fn(),
};

const likePort = {
    like: jest.fn(),
    unlike: jest.fn(),
    isLiked: jest.fn(),
    findLikedPostIds: jest.fn(),
};

const authorReader = { readAuthorSnapshot: jest.fn().mockResolvedValue(null) };
const notificationDispatch = {
    to: jest.fn().mockReturnValue({
        type: jest.fn().mockReturnThis(),
        title: jest.fn().mockReturnThis(),
        content: jest.fn().mockReturnThis(),
        metadata: jest.fn().mockReturnThis(),
        targetUrl: jest.fn().mockReturnThis(),
        send: jest.fn().mockResolvedValue({}),
    }),
    createNotification: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('LikeCommunityPostUseCase', () => {
    const useCase = new LikeCommunityPostUseCase(
        reader as any,
        likePort as any,
        authorReader as any,
        notificationDispatch as any,
    );

    it('존재하지 않는 게시글 → BadRequestException, like 미호출', async () => {
        reader.existsActivePost.mockResolvedValueOnce(false);
        await expect(useCase.execute('p-x', 'u-1', 'Adopter')).rejects.toThrow(BadRequestException);
        expect(likePort.like).not.toHaveBeenCalled();
    });

    it('정상 — like 호출 + { liked: true } 반환', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        likePort.like.mockResolvedValueOnce({ alreadyLiked: false });

        const result = await useCase.execute('p-1', 'u-1', 'Adopter');

        expect(likePort.like).toHaveBeenCalledWith('p-1', 'u-1', 'Adopter');
        expect(result).toEqual({ postId: 'p-1', liked: true });
    });

    it('이미 좋아요한 게시글 → { liked: false } (멱등)', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        likePort.like.mockResolvedValueOnce({ alreadyLiked: true });

        const result = await useCase.execute('p-1', 'u-1', 'Adopter');
        expect(result).toEqual({ postId: 'p-1', liked: false });
    });
});

describe('UnlikeCommunityPostUseCase', () => {
    const useCase = new UnlikeCommunityPostUseCase(reader as any, likePort as any);

    it('존재하지 않는 게시글 → BadRequestException, unlike 미호출', async () => {
        reader.existsActivePost.mockResolvedValueOnce(false);
        await expect(useCase.execute('p-x', 'u-1')).rejects.toThrow(BadRequestException);
        expect(likePort.unlike).not.toHaveBeenCalled();
    });

    it('정상 — unlike 호출 + { unliked: true } 반환', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        likePort.unlike.mockResolvedValueOnce({ wasLiked: true });

        const result = await useCase.execute('p-1', 'u-1');

        expect(likePort.unlike).toHaveBeenCalledWith('p-1', 'u-1');
        expect(result).toEqual({ postId: 'p-1', unliked: true });
    });

    it('좋아요 안 한 게시글 취소 → { unliked: false } (멱등)', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        likePort.unlike.mockResolvedValueOnce({ wasLiked: false });

        const result = await useCase.execute('p-1', 'u-1');
        expect(result).toEqual({ postId: 'p-1', unliked: false });
    });
});
