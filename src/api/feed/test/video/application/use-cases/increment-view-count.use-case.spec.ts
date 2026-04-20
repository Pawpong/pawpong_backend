import { IncrementViewCountUseCase } from '../../../../video/application/use-cases/increment-view-count.use-case';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';
import { FeedVideoCommandPort } from '../../../../video/application/ports/feed-video-command.port';

describe('조회수 증가 유스케이스', () => {
    it('조회수를 비동기로 증가시키고 메타 캐시를 무효화한다', async () => {
        const feedVideoCommand: FeedVideoCommandPort = {
            createPendingVideo: jest.fn(),
            findById: jest.fn(),
            markAsProcessing: jest.fn(),
            readMine: jest.fn(),
            countMine: jest.fn(),
            deleteById: jest.fn(),
            updateVisibility: jest.fn(),
            incrementViewCount: jest.fn().mockResolvedValue(undefined),
            markEncodingComplete: jest.fn(),
            markEncodingFailed: jest.fn(),
        };
        const cacheManager = {
            del: jest.fn().mockResolvedValue(undefined),
        };
        const useCase = new IncrementViewCountUseCase(
            feedVideoCommand,
            cacheManager as any,
            new FeedCacheKeyService(),
        );

        await useCase.execute('video-1');

        expect(feedVideoCommand.incrementViewCount).toHaveBeenCalledWith('video-1');
        expect(cacheManager.del).toHaveBeenCalledWith('video:meta:video-1');
    });
});
