import { GetMyVideosUseCase } from '../../../application/use-cases/get-my-videos.use-case';
import { FeedVideoLibraryAssemblerService } from '../../../domain/services/feed-video-library-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';

describe('내 비디오 목록 조회 유스케이스', () => {
    const feedVideoCommand = {
        readMine: jest.fn(),
        countMine: jest.fn(),
    };
    const feedVideoAssetUrlPort = {
        getSignedUrl: jest.fn().mockResolvedValue('https://cdn.example.com/thumb.jpg'),
    };

    const useCase = new GetMyVideosUseCase(
        feedVideoCommand as any,
        new FeedVideoLibraryAssemblerService(new FeedVideoSummaryMapperService()),
        feedVideoAssetUrlPort as any,
    );

    const mockVideo = {
        id: 'video-1',
        title: '내 강아지 영상',
        status: 'ready',
        thumbnailKey: 'thumb/video-1.jpg',
        duration: 30,
        viewCount: 50,
        isPublic: true,
        createdAt: new Date(),
        failureReason: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        feedVideoAssetUrlPort.getSignedUrl.mockResolvedValue('https://cdn.example.com/thumb.jpg');
    });

    it('정상적으로 내 비디오 목록을 반환한다', async () => {
        feedVideoCommand.readMine.mockResolvedValue([mockVideo]);
        feedVideoCommand.countMine.mockResolvedValue(1);

        const result = await useCase.execute('breeder-1', 1, 20);

        expect(result.items).toHaveLength(1);
        expect(result.items[0].videoId).toBe('video-1');
        expect(result.pagination.totalItems).toBe(1);
        expect(feedVideoCommand.readMine).toHaveBeenCalledWith('breeder-1', 0, 20);
    });

    it('비디오가 없으면 빈 배열을 반환한다', async () => {
        feedVideoCommand.readMine.mockResolvedValue([]);
        feedVideoCommand.countMine.mockResolvedValue(0);

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
    });

    it('페이지 2 요청 시 skip을 올바르게 계산한다', async () => {
        feedVideoCommand.readMine.mockResolvedValue([]);
        feedVideoCommand.countMine.mockResolvedValue(25);

        await useCase.execute('breeder-1', 2, 20);

        expect(feedVideoCommand.readMine).toHaveBeenCalledWith('breeder-1', 20, 20);
    });
});
