import { GetPopularVideosUseCase } from '../../../application/use-cases/get-popular-videos.use-case';
import { FeedVideoPublicListAssemblerService } from '../../../domain/services/feed-video-public-list-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';

describe('인기 비디오 목록 조회 유스케이스', () => {
    const feedVideoReader = {
        readPopular: jest.fn(),
    };
    const feedVideoAssetUrlPort = {
        getSignedUrl: jest.fn().mockResolvedValue('https://cdn.example.com/thumb.jpg'),
    };
    const cacheManager = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new GetPopularVideosUseCase(
        feedVideoReader as any,
        new FeedVideoPublicListAssemblerService(new FeedVideoSummaryMapperService()),
        feedVideoAssetUrlPort as any,
        cacheManager as any,
        new FeedCacheKeyService(),
    );

    const mockVideo = {
        id: 'video-1',
        title: '인기 강아지 영상',
        thumbnailKey: 'thumb/video-1.jpg',
        viewCount: 1000,
        likeCount: 200,
        uploadedBy: { id: 'breeder-1', name: '행복브리더', profileImageFileName: null },
        createdAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        cacheManager.get.mockResolvedValue(null);
        cacheManager.set.mockResolvedValue(undefined);
        feedVideoAssetUrlPort.getSignedUrl.mockResolvedValue('https://cdn.example.com/thumb.jpg');
    });

    it('인기 비디오 목록을 반환한다', async () => {
        feedVideoReader.readPopular.mockResolvedValue([mockVideo]);

        const result = await useCase.execute(10);

        expect(result).toHaveLength(1);
        expect(result[0].videoId).toBe('video-1');
        expect(feedVideoReader.readPopular).toHaveBeenCalledWith(10);
    });

    it('캐시가 있으면 DB를 조회하지 않는다', async () => {
        const cachedResult = [{ videoId: 'cached-1' }];
        cacheManager.get.mockResolvedValue(cachedResult);

        const result = await useCase.execute(10);

        expect(result).toBe(cachedResult);
        expect(feedVideoReader.readPopular).not.toHaveBeenCalled();
    });

    it('인기 비디오가 없으면 빈 배열을 반환한다', async () => {
        feedVideoReader.readPopular.mockResolvedValue([]);

        const result = await useCase.execute(10);

        expect(result).toHaveLength(0);
    });
});
