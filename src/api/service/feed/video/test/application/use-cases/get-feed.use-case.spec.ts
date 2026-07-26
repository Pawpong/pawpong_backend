import { GetFeedUseCase } from '../../../application/use-cases/get-feed.use-case';
import { FeedVideoPublicListAssemblerService } from '../../../domain/services/feed-video-public-list-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';

describe('비디오 피드 목록 조회 유스케이스', () => {
    const feedVideoReader = {
        readPublicFeed: jest.fn(),
        countPublicFeed: jest.fn(),
    };
    const feedVideoAssetUrlPort = {
        getSignedUrl: jest.fn().mockResolvedValue('https://cdn.example.com/video.m3u8'),
    };
    const cacheManager = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new GetFeedUseCase(
        feedVideoReader as any,
        new FeedVideoPublicListAssemblerService(new FeedVideoSummaryMapperService()),
        feedVideoAssetUrlPort as any,
        cacheManager as any,
        new FeedCacheKeyService(),
    );

    const mockVideo = {
        id: 'video-1',
        title: '강아지 영상',
        thumbnailKey: 'thumb/video-1.jpg',
        hlsManifestKey: 'hls/video-1.m3u8',
        duration: 30,
        viewCount: 100,
        likeCount: 10,
        uploadedBy: { id: 'breeder-1', name: '행복브리더', profileImageFileName: null },
        createdAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        cacheManager.get.mockResolvedValue(null);
        cacheManager.set.mockResolvedValue(undefined);
        feedVideoAssetUrlPort.getSignedUrl.mockResolvedValue('https://cdn.example.com/video.m3u8');
    });

    it('정상적으로 피드 목록을 반환한다', async () => {
        feedVideoReader.readPublicFeed.mockResolvedValue([mockVideo]);
        feedVideoReader.countPublicFeed.mockResolvedValue(1);

        const result = await useCase.execute(1, 20);

        expect(result.items).toHaveLength(1);
        expect(result.items[0].videoId).toBe('video-1');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('캐시가 있으면 DB를 조회하지 않고 캐시를 반환한다', async () => {
        const cachedResult = { items: [], pagination: {} };
        cacheManager.get.mockResolvedValue(cachedResult);

        const result = await useCase.execute(1, 20);

        expect(result).toBe(cachedResult);
        expect(feedVideoReader.readPublicFeed).not.toHaveBeenCalled();
    });

    it('영상이 없으면 빈 배열을 반환한다', async () => {
        feedVideoReader.readPublicFeed.mockResolvedValue([]);
        feedVideoReader.countPublicFeed.mockResolvedValue(0);

        const result = await useCase.execute(1, 20);

        expect(result.items).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
    });
});
