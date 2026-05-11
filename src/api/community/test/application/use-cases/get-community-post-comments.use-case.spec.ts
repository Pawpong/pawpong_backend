import { BadRequestException } from '@nestjs/common';

import { GetCommunityPostCommentsUseCase } from '../../../application/use-cases/get-community-post-comments.use-case';
import { CommunityPostMapperService } from '../../../domain/services/community-post-mapper.service';

const assetUrl = { toSignedUrl: () => undefined };
const mapper = new CommunityPostMapperService(assetUrl as any);

describe('GetCommunityPostCommentsUseCase', () => {
    const reader = { listPosts: jest.fn(), readPostById: jest.fn(), listComments: jest.fn() };
    const useCase = new GetCommunityPostCommentsUseCase(reader as any, mapper);

    beforeEach(() => jest.clearAllMocks());

    it('page=1 — 게시글 존재 확인 후 댓글 조회', async () => {
        reader.readPostById.mockResolvedValueOnce({ postId: 'p-1' });
        reader.listComments.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({ postId: 'p-1' });
        expect(reader.readPostById).toHaveBeenCalledWith('p-1');
        expect(reader.listComments).toHaveBeenCalledWith({ postId: 'p-1', skip: 0, limit: 20 });
    });

    it('page=1 + 게시글 없음 → BadRequest', async () => {
        reader.readPostById.mockResolvedValueOnce(null);
        await expect(useCase.execute({ postId: 'p-x' })).rejects.toThrow(BadRequestException);
        expect(reader.listComments).not.toHaveBeenCalled();
    });

    it('page>=2 — 게시글 존재 확인 생략 (비용 절감)', async () => {
        reader.listComments.mockResolvedValueOnce({ snapshots: [], totalItems: 100 });
        await useCase.execute({ postId: 'p-1', page: 3, pageSize: 10 });
        expect(reader.readPostById).not.toHaveBeenCalled();
        expect(reader.listComments).toHaveBeenCalledWith({ postId: 'p-1', skip: 20, limit: 10 });
    });

    it('pageSize 상한 100 적용', async () => {
        reader.listComments.mockResolvedValueOnce({ snapshots: [], totalItems: 0 });
        await useCase.execute({ postId: 'p-1', page: 2, pageSize: 999 });
        expect(reader.listComments.mock.calls[0][0]).toMatchObject({ skip: 100, limit: 100 });
    });
});
