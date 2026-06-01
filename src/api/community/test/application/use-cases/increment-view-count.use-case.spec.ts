import { BadRequestException } from '@nestjs/common';

import { IncrementViewCountUseCase } from '../../../application/use-cases/increment-view-count.use-case';

describe('IncrementViewCountUseCase', () => {
    const reader = {
        listPosts: jest.fn(),
        readPostById: jest.fn(),
        readPostsByIds: jest.fn(),
        existsActivePost: jest.fn(),
        listComments: jest.fn(),
    };
    const writer = {
        create: jest.fn(),
        updateByAuthor: jest.fn(),
        softDeleteByAuthor: jest.fn(),
        incrementViewCount: jest.fn(),
    };

    const useCase = new IncrementViewCountUseCase(reader as any, writer as any);

    beforeEach(() => jest.clearAllMocks());

    it('존재하지 않는 게시글 → BadRequestException, incrementViewCount 미호출', async () => {
        reader.existsActivePost.mockResolvedValueOnce(false);
        await expect(useCase.execute('p-missing')).rejects.toThrow(BadRequestException);
        expect(writer.incrementViewCount).not.toHaveBeenCalled();
    });

    it('활성 게시글 → incrementViewCount 호출', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        writer.incrementViewCount.mockResolvedValueOnce(undefined);

        await expect(useCase.execute('p-1')).resolves.toBeUndefined();
        expect(reader.existsActivePost).toHaveBeenCalledWith('p-1');
        expect(writer.incrementViewCount).toHaveBeenCalledWith('p-1');
    });

    it('동일 postId 두 번 호출 → 두 번 모두 incrementViewCount 호출 (단순 증가)', async () => {
        reader.existsActivePost.mockResolvedValue(true);
        writer.incrementViewCount.mockResolvedValue(undefined);

        await useCase.execute('p-1');
        await useCase.execute('p-1');
        expect(writer.incrementViewCount).toHaveBeenCalledTimes(2);
    });
});
