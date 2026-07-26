import { BadRequestException } from '@nestjs/common';

import { GetCommunityPostDetailUseCase } from '../../../application/use-cases/get-community-post-detail.use-case';
import { CommunityPostMapperService } from '../../../domain/services/community-post-mapper.service';

const assetUrl = { toSignedUrl: () => undefined };
const mapper = new CommunityPostMapperService(assetUrl as any);

const postSnap = {
    postId: 'p-1',
    authorId: 'a-1',
    authorModel: 'Adopter' as const,
    authorNickname: '닉',
    body: '본문',
    photos: [],
    visibility: 'public' as const,
    status: 'published' as const,
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    viewCount: 0,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
};

describe('GetCommunityPostDetailUseCase', () => {
    const reader = { listPosts: jest.fn(), readPostById: jest.fn(), listComments: jest.fn() };
    const likePort = {
        like: jest.fn(),
        unlike: jest.fn(),
        isLiked: jest.fn().mockResolvedValue(false),
        findLikedPostIds: jest.fn(),
    };
    const bookmarkPort = {
        save: jest.fn(),
        unsave: jest.fn(),
        listSavedPostIds: jest.fn(),
        findSavedPostIds: jest.fn().mockResolvedValue(new Set()),
    };
    const followReader = {
        listFolloweeIds: jest.fn().mockResolvedValue([]),
        isFollowing: jest.fn().mockResolvedValue(false),
    };
    const useCase = new GetCommunityPostDetailUseCase(
        reader as any,
        likePort as any,
        bookmarkPort as any,
        followReader as any,
        mapper,
    );

    beforeEach(() => jest.clearAllMocks());

    it('게시글 없으면 BadRequest, listComments 안 호출', async () => {
        reader.readPostById.mockResolvedValueOnce(null);
        await expect(useCase.execute('p-x')).rejects.toThrow(BadRequestException);
        expect(reader.listComments).not.toHaveBeenCalled();
    });

    it('상세 + 댓글 첫 5개만 가져온다 (limit=5)', async () => {
        reader.readPostById.mockResolvedValueOnce(postSnap);
        reader.listComments.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });

        const result = await useCase.execute('p-1');

        expect(reader.listComments).toHaveBeenCalledWith({ postId: 'p-1', skip: 0, limit: 5 });
        expect(result.postId).toBe('p-1');
        expect(result.commentPreview).toEqual([]);
    });

    it('비인증(userId 없음) → isSaved: false, findSavedPostIds 미호출', async () => {
        reader.readPostById.mockResolvedValueOnce(postSnap);
        reader.listComments.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });

        const result = await useCase.execute('p-1');

        expect(bookmarkPort.findSavedPostIds).not.toHaveBeenCalled();
        expect(result.isSaved).toBe(false);
    });

    it('인증 + 저장된 게시글 → isSaved: true', async () => {
        reader.readPostById.mockResolvedValueOnce(postSnap);
        reader.listComments.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        likePort.isLiked.mockResolvedValueOnce(false);
        bookmarkPort.findSavedPostIds.mockResolvedValueOnce(new Set(['p-1']));

        const result = await useCase.execute('p-1', 'u-1');

        expect(bookmarkPort.findSavedPostIds).toHaveBeenCalledWith('u-1', ['p-1']);
        expect(result.isSaved).toBe(true);
    });

    it('인증 + 저장 안 한 게시글 → isSaved: false', async () => {
        reader.readPostById.mockResolvedValueOnce(postSnap);
        reader.listComments.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        likePort.isLiked.mockResolvedValueOnce(false);
        bookmarkPort.findSavedPostIds.mockResolvedValueOnce(new Set());

        const result = await useCase.execute('p-1', 'u-1');

        expect(result.isSaved).toBe(false);
    });
});
