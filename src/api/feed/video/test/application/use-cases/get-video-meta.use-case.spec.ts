import { BadRequestException } from '@nestjs/common';

import { VideoStatus } from '../../../../../../common/enum/video-status.enum';
import { GetVideoMetaUseCase } from '../../../application/use-cases/get-video-meta.use-case';
import { FeedVideoMetaAssemblerService } from '../../../domain/services/feed-video-meta-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';

describe('비디오 메타정보 조회 유스케이스', () => {
    const feedVideoReader = {
        readById: jest.fn(),
    };
    const feedVideoAssetUrlPort = {
        getSignedUrl: jest.fn().mockResolvedValue('https://cdn.example.com/video.m3u8'),
    };
    const cacheManager = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new GetVideoMetaUseCase(
        feedVideoReader as any,
        new FeedVideoMetaAssemblerService(new FeedVideoSummaryMapperService()),
        feedVideoAssetUrlPort as any,
        cacheManager as any,
        new FeedCacheKeyService(),
    );

    const mockReadyVideo = {
        id: 'video-1',
        title: '강아지 영상',
        description: '귀여운 강아지',
        status: VideoStatus.READY,
        hlsManifestKey: 'hls/video-1.m3u8',
        thumbnailKey: 'thumb/video-1.jpg',
        duration: 30,
        viewCount: 100,
        likeCount: 10,
        uploadedBy: { id: 'breeder-1', name: '행복브리더', profileImageFileName: null },
        createdAt: new Date(),
        isPublic: true,
        tags: [],
        failureReason: null,
    };

    const mockPendingVideo = {
        ...mockReadyVideo,
        status: VideoStatus.PENDING,
        id: 'video-2',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        cacheManager.get.mockResolvedValue(null);
        cacheManager.set.mockResolvedValue(undefined);
        feedVideoAssetUrlPort.getSignedUrl.mockResolvedValue('https://cdn.example.com/video.m3u8');
    });

    it('READY 상태의 비디오 메타정보를 반환한다', async () => {
        feedVideoReader.readById.mockResolvedValue(mockReadyVideo);

        const result = await useCase.execute('video-1');

        expect(result.videoId).toBe('video-1');
        expect(result.status).toBe(VideoStatus.READY);
    });

    it('PENDING 상태면 pending 응답을 반환한다', async () => {
        feedVideoReader.readById.mockResolvedValue(mockPendingVideo);

        const result = await useCase.execute('video-2');

        expect(result.videoId).toBe('video-2');
        expect(result.status).toBe(VideoStatus.PENDING);
        expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('캐시가 있으면 DB를 조회하지 않는다', async () => {
        const cachedResult = { videoId: 'video-1', status: VideoStatus.READY };
        cacheManager.get.mockResolvedValue(cachedResult);

        const result = await useCase.execute('video-1');

        expect(result).toBe(cachedResult);
        expect(feedVideoReader.readById).not.toHaveBeenCalled();
    });

    it('비디오를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        feedVideoReader.readById.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent-video')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('nonexistent-video')).rejects.toThrow('동영상을 찾을 수 없습니다.');
    });
});
