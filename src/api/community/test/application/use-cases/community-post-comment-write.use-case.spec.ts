import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { CreateCommunityPostCommentUseCase } from '../../../application/use-cases/create-community-post-comment.use-case';
import { DeleteCommunityPostCommentUseCase } from '../../../application/use-cases/delete-community-post-comment.use-case';
import { UpdateCommunityPostCommentUseCase } from '../../../application/use-cases/update-community-post-comment.use-case';

const reader = {
    existsActivePost: jest.fn(),
    listPosts: jest.fn(),
    readPostById: jest.fn(),
    readPostsByIds: jest.fn(),
    listComments: jest.fn(),
};

const commentWriter = {
    createComment: jest.fn(),
    updateCommentByAuthor: jest.fn(),
    softDeleteCommentByAuthor: jest.fn(),
};

const commentReader = {
    readCommentById: jest.fn(),
};

const authorReader = {
    readAuthorSnapshot: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('CreateCommunityPostCommentUseCase', () => {
    const useCase = new CreateCommunityPostCommentUseCase(reader as any, authorReader as any, commentWriter as any);

    it('존재하지 않는 게시글 → BadRequestException', async () => {
        reader.existsActivePost.mockResolvedValueOnce(false);
        await expect(useCase.execute('p-x', 'u-1', 'adopter', { body: '댓글' })).rejects.toThrow(BadRequestException);
        expect(commentWriter.createComment).not.toHaveBeenCalled();
    });

    it('작성자 정보 없음 → BadRequestException', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        authorReader.readAuthorSnapshot.mockResolvedValueOnce(null);
        await expect(useCase.execute('p-1', 'u-1', 'adopter', { body: '댓글' })).rejects.toThrow(BadRequestException);
    });

    it('정상 댓글 작성 → createComment 호출 + commentId 반환', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        authorReader.readAuthorSnapshot.mockResolvedValueOnce({
            authorId: 'u-1',
            authorModel: 'Adopter',
            authorNickname: '닉',
            authorProfileImageFileName: undefined,
        });
        commentWriter.createComment.mockResolvedValueOnce({ commentId: 'c-1' });

        const result = await useCase.execute('p-1', 'u-1', 'adopter', { body: '댓글 내용' });

        expect(commentWriter.createComment).toHaveBeenCalledWith(
            expect.objectContaining({ postId: 'p-1', body: '댓글 내용', parentCommentId: undefined }),
        );
        expect(result.commentId).toBe('c-1');
    });

    it('답글(parentCommentId 있음) → parentCommentId 전달', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        authorReader.readAuthorSnapshot.mockResolvedValueOnce({
            authorId: 'u-1',
            authorModel: 'Adopter',
            authorNickname: '닉',
        });
        commentWriter.createComment.mockResolvedValueOnce({ commentId: 'c-2' });

        await useCase.execute('p-1', 'u-1', 'adopter', { body: '답글', parentCommentId: 'c-parent' });

        expect(commentWriter.createComment).toHaveBeenCalledWith(
            expect.objectContaining({ parentCommentId: 'c-parent' }),
        );
    });

    it('빈 body → BadRequestException', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        authorReader.readAuthorSnapshot.mockResolvedValueOnce({
            authorId: 'u-1',
            authorModel: 'Adopter',
            authorNickname: '닉',
        });
        await expect(useCase.execute('p-1', 'u-1', 'adopter', { body: '   ' })).rejects.toThrow(BadRequestException);
    });
});

describe('UpdateCommunityPostCommentUseCase', () => {
    const useCase = new UpdateCommunityPostCommentUseCase(commentReader as any, commentWriter as any);

    it('존재하지 않는 댓글 → BadRequestException', async () => {
        commentReader.readCommentById.mockResolvedValueOnce(null);
        await expect(useCase.execute('c-x', 'u-1', '수정')).rejects.toThrow(BadRequestException);
    });

    it('타인 댓글 수정 → ForbiddenException', async () => {
        commentReader.readCommentById.mockResolvedValueOnce({ commentId: 'c-1', authorId: 'other' });
        await expect(useCase.execute('c-1', 'u-1', '수정')).rejects.toThrow(ForbiddenException);
    });

    it('정상 수정 → updateCommentByAuthor 호출', async () => {
        commentReader.readCommentById.mockResolvedValueOnce({ commentId: 'c-1', authorId: 'u-1' });
        commentWriter.updateCommentByAuthor.mockResolvedValueOnce({ changed: true });

        const result = await useCase.execute('c-1', 'u-1', '수정된 내용');

        expect(commentWriter.updateCommentByAuthor).toHaveBeenCalledWith('c-1', 'u-1', '수정된 내용');
        expect(result).toEqual({ commentId: 'c-1', updated: true });
    });
});

describe('DeleteCommunityPostCommentUseCase', () => {
    const useCase = new DeleteCommunityPostCommentUseCase(commentReader as any, commentWriter as any);

    it('존재하지 않는 댓글 → BadRequestException', async () => {
        commentReader.readCommentById.mockResolvedValueOnce(null);
        await expect(useCase.execute('c-x', 'u-1')).rejects.toThrow(BadRequestException);
    });

    it('타인 댓글 삭제 → ForbiddenException', async () => {
        commentReader.readCommentById.mockResolvedValueOnce({ commentId: 'c-1', authorId: 'other' });
        await expect(useCase.execute('c-1', 'u-1')).rejects.toThrow(ForbiddenException);
    });

    it('정상 삭제 → softDeleteCommentByAuthor 호출 + { deleted: true }', async () => {
        commentReader.readCommentById.mockResolvedValueOnce({ commentId: 'c-1', authorId: 'u-1' });
        commentWriter.softDeleteCommentByAuthor.mockResolvedValueOnce({ changed: true });

        const result = await useCase.execute('c-1', 'u-1');

        expect(commentWriter.softDeleteCommentByAuthor).toHaveBeenCalledWith('c-1', 'u-1');
        expect(result).toEqual({ deleted: true });
    });
});
