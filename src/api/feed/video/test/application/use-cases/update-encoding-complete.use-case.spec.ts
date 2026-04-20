import { UpdateEncodingCompleteUseCase } from '../../../application/use-cases/update-encoding-complete.use-case';
import { FeedVideoCommandPort, FeedVideoEncodingResult } from '../../../application/ports/feed-video-command.port';

function makeCommand(): FeedVideoCommandPort {
    return {
        createPendingVideo: jest.fn(),
        findById: jest.fn(),
        markAsProcessing: jest.fn(),
        readMine: jest.fn(),
        countMine: jest.fn(),
        deleteById: jest.fn(),
        updateVisibility: jest.fn(),
        incrementViewCount: jest.fn(),
        markEncodingComplete: jest.fn().mockResolvedValue(undefined),
        markEncodingFailed: jest.fn(),
    };
}

describe('인코딩 완료 처리 유스케이스', () => {
    it('인코딩 결과를 포트에 전달한다', async () => {
        const command = makeCommand();
        const useCase = new UpdateEncodingCompleteUseCase(command);
        const data: FeedVideoEncodingResult = {
            hlsManifestKey: 'videos/hls/video-1/master.m3u8',
            thumbnailKey: 'videos/thumbs/video-1.jpg',
            duration: 120,
            width: 1920,
            height: 1080,
        };

        await useCase.execute('video-1', data);

        expect(command.markEncodingComplete).toHaveBeenCalledWith('video-1', data);
    });
});
