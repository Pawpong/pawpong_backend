import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { DeleteCommunityPostUseCase } from '../../../application/use-cases/delete-community-post.use-case';

describe('DeleteCommunityPostUseCase', () => {
    const reader = { listPosts: jest.fn(), readPostById: jest.fn(), existsActivePost: jest.fn(), listComments: jest.fn() };
    const writer = { create: jest.fn(), updateByAuthor: jest.fn(), softDeleteByAuthor: jest.fn() };
    const useCase = new DeleteCommunityPostUseCase(reader as any, writer as any);

    beforeEach(() => {
        jest.clearAllMocks();
        writer.softDeleteByAuthor.mockResolvedValue({ changed: true });
    });

    it('없는 게시글 → BadRequest', async () => {
        reader.readPostById.mockResolvedValueOnce(null);
        await expect(useCase.execute('a-1', 'p-1')).rejects.toThrow(BadRequestException);
        expect(writer.softDeleteByAuthor).not.toHaveBeenCalled();
    });

    it('타인 게시글 → Forbidden', async () => {
        reader.readPostById.mockResolvedValueOnce({ postId: 'p-1', authorId: 'other' });
        await expect(useCase.execute('a-1', 'p-1')).rejects.toThrow(ForbiddenException);
        expect(writer.softDeleteByAuthor).not.toHaveBeenCalled();
    });

    it('본인 게시글 → softDeleteByAuthor 호출 + { deleted: true }', async () => {
        reader.readPostById.mockResolvedValueOnce({ postId: 'p-1', authorId: 'a-1' });
        const result = await useCase.execute('a-1', 'p-1');
        expect(writer.softDeleteByAuthor).toHaveBeenCalledWith('p-1', 'a-1');
        expect(result).toEqual({ deleted: true });
    });
});
