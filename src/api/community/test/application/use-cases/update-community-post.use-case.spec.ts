import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { UpdateCommunityPostUseCase } from '../../../application/use-cases/update-community-post.use-case';
import { CommunityPostMapperService } from '../../../domain/services/community-post-mapper.service';
import { CommunityPostWriteValidatorService } from '../../../domain/services/community-post-write-validator.service';

const assetUrl = { toSignedUrl: () => undefined };
const mapper = new CommunityPostMapperService(assetUrl as any);
const validator = new CommunityPostWriteValidatorService();

const existingPost = {
    postId: 'p-1',
    authorId: 'a-1',
    authorModel: 'Adopter' as const,
    authorNickname: '닉',
    body: '원본',
    photos: [],
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    viewCount: 0,
    createdAt: new Date(),
};

describe('UpdateCommunityPostUseCase', () => {
    const reader = {
        listPosts: jest.fn(),
        readPostById: jest.fn(),
        existsActivePost: jest.fn(),
        listComments: jest.fn(),
    };
    const writer = { create: jest.fn(), updateByAuthor: jest.fn(), softDeleteByAuthor: jest.fn() };

    const useCase = new UpdateCommunityPostUseCase(reader as any, writer as any, validator, mapper);

    beforeEach(() => {
        jest.clearAllMocks();
        writer.updateByAuthor.mockResolvedValue({ changed: true });
    });

    it('빈 patch → BadRequest', async () => {
        await expect(useCase.execute('a-1', 'p-1', {})).rejects.toThrow(BadRequestException);
        expect(writer.updateByAuthor).not.toHaveBeenCalled();
    });

    it('게시글 없음 → BadRequest', async () => {
        reader.readPostById.mockResolvedValueOnce(null);
        await expect(useCase.execute('a-1', 'p-1', { body: '새 본문' })).rejects.toThrow(BadRequestException);
        expect(writer.updateByAuthor).not.toHaveBeenCalled();
    });

    it('다른 사람 게시글 수정 시도 → Forbidden', async () => {
        reader.readPostById.mockResolvedValueOnce({ ...existingPost, authorId: 'someone-else' });
        await expect(useCase.execute('a-1', 'p-1', { body: '새 본문' })).rejects.toThrow(ForbiddenException);
        expect(writer.updateByAuthor).not.toHaveBeenCalled();
    });

    it('정상 — patch.body trim 후 전달, 갱신 후 다시 조회한 상세 반환', async () => {
        reader.readPostById.mockResolvedValueOnce(existingPost);
        reader.readPostById.mockResolvedValueOnce({ ...existingPost, body: '수정된 본문' });
        const result = await useCase.execute('a-1', 'p-1', { body: '  수정된 본문  ' });
        expect(writer.updateByAuthor).toHaveBeenCalledWith(
            'p-1',
            'a-1',
            expect.objectContaining({ body: '수정된 본문' }),
        );
        expect(result.body).toBe('수정된 본문');
    });
});
