import { IncrementViewCountUseCase } from './increment-view-count.use-case';
import { FeedVideoCommandPort } from '../ports/feed-video-command.port';
import { FeedVideoStreamingService } from '../../domain/services/feed-video-streaming.service';

describe('IncrementViewCountUseCase', () => {
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
            new FeedVideoStreamingService(),
        );

        await useCase.execute('video-1');

        expect(feedVideoCommand.incrementViewCount).toHaveBeenCalledWith('video-1');
        expect(cacheManager.del).toHaveBeenCalledWith('video:meta:video-1');
    });
});
