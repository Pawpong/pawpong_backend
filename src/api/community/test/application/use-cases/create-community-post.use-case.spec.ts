import { BadRequestException } from '@nestjs/common';

import { CreateCommunityPostUseCase } from '../../../application/use-cases/create-community-post.use-case';
import { CommunityPostMapperService } from '../../../domain/services/community-post-mapper.service';
import { CommunityPostWriteValidatorService } from '../../../domain/services/community-post-write-validator.service';

const assetUrl = { toSignedUrl: () => undefined };
const mapper = new CommunityPostMapperService(assetUrl as any);
const validator = new CommunityPostWriteValidatorService();

describe('CreateCommunityPostUseCase', () => {
    const authorReader = { readAuthorSnapshot: jest.fn() };
    const writer = { create: jest.fn(), updateByAuthor: jest.fn(), softDeleteByAuthor: jest.fn() };
    const reader = { listPosts: jest.fn(), readPostById: jest.fn(), existsActivePost: jest.fn(), listComments: jest.fn() };

    const useCase = new CreateCommunityPostUseCase(
        authorReader as any,
        writer as any,
        reader as any,
        validator,
        mapper,
    );

    beforeEach(() => {
        jest.clearAllMocks();
        authorReader.readAuthorSnapshot.mockResolvedValue({
            authorId: 'a-1',
            authorModel: 'Adopter',
            authorNickname: '닉',
        });
        writer.create.mockResolvedValue({ postId: 'p-1' });
        reader.readPostById.mockResolvedValue({
            postId: 'p-1',
            authorId: 'a-1',
            authorModel: 'Adopter',
            authorNickname: '닉',
            body: '본문',
            photos: [],
            likeCount: 0,
            commentCount: 0,
            saveCount: 0,
            viewCount: 0,
            createdAt: new Date(),
        });
    });

    it('작성자 정보 없음 → BadRequest, writer 호출 안 됨', async () => {
        authorReader.readAuthorSnapshot.mockResolvedValueOnce(null);
        await expect(useCase.execute('a-1', 'adopter', { body: '본문' })).rejects.toThrow(BadRequestException);
        expect(writer.create).not.toHaveBeenCalled();
    });

    it('정상 — denormalized author snapshot 이 writer.create 에 함께 전달', async () => {
        await useCase.execute('a-1', 'adopter', { body: '본문' });
        const payload = writer.create.mock.calls[0][0];
        expect(payload.authorId).toBe('a-1');
        expect(payload.authorModel).toBe('Adopter');
        expect(payload.authorNickname).toBe('닉');
        expect(payload.body).toBe('본문');
        expect(payload.photos).toEqual([]);
    });

    it('breeder role → authorModel="Breeder"', async () => {
        authorReader.readAuthorSnapshot.mockResolvedValueOnce({
            authorId: 'b-1',
            authorModel: 'Breeder',
            authorNickname: '브',
        });
        await useCase.execute('b-1', 'breeder', { body: '본문' });
        const payload = writer.create.mock.calls[0][0];
        expect(payload.authorModel).toBe('Breeder');
    });

    it('생성 직후 조회 실패 → BadRequest (도큐먼트 일관성 가드)', async () => {
        reader.readPostById.mockResolvedValueOnce(null);
        await expect(useCase.execute('a-1', 'adopter', { body: '본문' })).rejects.toThrow(BadRequestException);
    });
});
