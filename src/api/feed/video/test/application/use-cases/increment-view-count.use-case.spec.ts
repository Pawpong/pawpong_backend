import { IncrementViewCountUseCase } from '../../../application/use-cases/increment-view-count.use-case';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';

describe('비디오 조회수 증가 유스케이스', () => {
    const feedVideoCommand = {
        incrementViewCount: jest.fn(),
    };
    const cacheManager = {
        del: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new IncrementViewCountUseCase(
        feedVideoCommand as any,
        cacheManager as any,
        new FeedCacheKeyService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
        cacheManager.del.mockResolvedValue(undefined);
    });

    it('조회수를 증가시키고 캐시를 삭제한다', async () => {
        feedVideoCommand.incrementViewCount.mockResolvedValue(undefined);

        await useCase.execute('video-1');

        expect(cacheManager.del).toHaveBeenCalledWith('video:meta:video-1');
    });

    it('조회수 증가가 실패해도 예외를 던지지 않는다', async () => {
        feedVideoCommand.incrementViewCount.mockRejectedValue(new Error('DB error'));

        await expect(useCase.execute('video-1')).resolves.toBeUndefined();
    });
});
