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
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    viewCount: 0,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
};

describe('GetCommunityPostDetailUseCase', () => {
    const reader = { listPosts: jest.fn(), readPostById: jest.fn(), listComments: jest.fn() };
    const useCase = new GetCommunityPostDetailUseCase(reader as any, mapper);

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
});
