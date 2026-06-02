import { BadRequestException } from '@nestjs/common';

import { IncrementViewCountUseCase } from '../../../application/use-cases/increment-view-count.use-case';

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
/** RedisService 모의 — exists/set 만 사용 */
const redis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
};

const useCase = new IncrementViewCountUseCase(reader as any, writer as any, redis as any);

beforeEach(() => jest.clearAllMocks());

describe('IncrementViewCountUseCase', () => {
    it('존재하지 않는 게시글 → BadRequestException, incrementViewCount 미호출', async () => {
        reader.existsActivePost.mockResolvedValueOnce(false);
        await expect(useCase.execute('p-missing')).rejects.toThrow(BadRequestException);
        expect(writer.incrementViewCount).not.toHaveBeenCalled();
    });

    it('비인증(userId 없음) → Redis 확인 없이 항상 증가', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        writer.incrementViewCount.mockResolvedValueOnce(undefined);

        await useCase.execute('p-1');

        expect(redis.exists).not.toHaveBeenCalled();
        expect(writer.incrementViewCount).toHaveBeenCalledWith('p-1');
    });

    it('인증 + 최초 방문 → Redis key 없음 → 증가 + key 저장', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        redis.exists.mockResolvedValueOnce(false);
        writer.incrementViewCount.mockResolvedValueOnce(undefined);

        await useCase.execute('p-1', 'u-1');

        expect(redis.exists).toHaveBeenCalledWith('community:view:u-1:p-1');
        expect(writer.incrementViewCount).toHaveBeenCalledWith('p-1');
        expect(redis.set).toHaveBeenCalledWith('community:view:u-1:p-1', '1', 86400);
    });

    it('인증 + 이미 방문(Redis hit) → 증가 생략 (dedup)', async () => {
        reader.existsActivePost.mockResolvedValueOnce(true);
        redis.exists.mockResolvedValueOnce(true);

        await useCase.execute('p-1', 'u-1');

        expect(writer.incrementViewCount).not.toHaveBeenCalled();
        expect(redis.set).not.toHaveBeenCalled();
    });

    it('서로 다른 사용자는 같은 게시글에 각각 증가', async () => {
        reader.existsActivePost.mockResolvedValue(true);
        redis.exists.mockResolvedValue(false);
        writer.incrementViewCount.mockResolvedValue(undefined);

        await useCase.execute('p-1', 'u-A');
        await useCase.execute('p-1', 'u-B');

        expect(writer.incrementViewCount).toHaveBeenCalledTimes(2);
    });
});
