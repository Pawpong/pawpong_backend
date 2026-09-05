import { BadRequestException } from '@nestjs/common';

import { ReportCommunityPostUseCase } from '../../../application/use-cases/report-community-post.use-case';

const reader = {
    existsActivePost: jest.fn(),
    listPosts: jest.fn(),
    readPostById: jest.fn(),
    readPostsByIds: jest.fn(),
    listComments: jest.fn(),
};

const authorReader = {
    readAuthorSnapshot: jest.fn(),
};

const reportPort = {
    report: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('ReportCommunityPostUseCase', () => {
    const useCase = new ReportCommunityPostUseCase(reader as any, authorReader as any, reportPort as any);

    it('존재하지 않는 게시글 → BadRequestException, report 미호출', async () => {
        reader.existsActivePost.mockResolvedValueOnce(false);

        await expect(useCase.execute('p-x', 'u-1', 'adopter', { reason: 'spam' })).rejects.toThrow(BadRequestException);

        expect(reportPort.report).not.toHaveBeenCalled();
    });

    it('작성자 스냅샷 없음 → BadRequestException', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        authorReader.readAuthorSnapshot.mockResolvedValueOnce(null);

        await expect(useCase.execute('p-1', 'u-1', 'adopter', { reason: 'spam' })).rejects.toThrow(BadRequestException);

        expect(reportPort.report).not.toHaveBeenCalled();
    });

    it('정상 신고 → { postId, reported: true }', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        authorReader.readAuthorSnapshot.mockResolvedValueOnce({
            authorNickname: '닉네임',
            authorProfileImageFileName: null,
            authorId: 'u-1',
            authorModel: 'Adopter',
        });
        reportPort.report.mockResolvedValueOnce({ alreadyReported: false });

        const result = await useCase.execute('p-1', 'u-1', 'adopter', {
            reason: 'spam',
            description: '스팸입니다.',
        });

        expect(reportPort.report).toHaveBeenCalledWith({
            postId: 'p-1',
            reporterId: 'u-1',
            reporterModel: 'Adopter',
            reporterNickname: '닉네임',
            reason: 'spam',
            description: '스팸입니다.',
        });
        expect(result).toEqual({ postId: 'p-1', reported: true });
    });

    it('이미 신고한 게시글 → { reported: false } (멱등)', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        authorReader.readAuthorSnapshot.mockResolvedValueOnce({
            authorNickname: '닉네임',
            authorId: 'u-1',
            authorModel: 'Adopter',
        });
        reportPort.report.mockResolvedValueOnce({ alreadyReported: true });

        const result = await useCase.execute('p-1', 'u-1', 'adopter', { reason: 'false_info' });
        expect(result).toEqual({ postId: 'p-1', reported: false });
    });

    it('isActive=false 게시글 → BadRequestException', async () => {
        reader.existsActivePost.mockResolvedValueOnce(false);

        await expect(useCase.execute('p-hidden', 'u-1', 'adopter', { reason: 'other' })).rejects.toThrow(
            BadRequestException,
        );
    });
});
