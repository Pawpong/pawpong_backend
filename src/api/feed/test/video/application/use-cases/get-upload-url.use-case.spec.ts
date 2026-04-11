import { GetUploadUrlUseCase } from '../../../../video/application/use-cases/get-upload-url.use-case';
import { FeedVideoCommandPort } from '../../../../video/application/ports/feed-video-command.port';
import { FeedVideoFileStoragePort } from '../../../../video/application/ports/feed-video-file-storage.port';

describe('업로드 주소 조회 유스케이스', () => {
    it('업로드 주소과 대기 비디오 레코드를 함께 생성한다', async () => {
        const feedVideoCommand: FeedVideoCommandPort = {
            createPendingVideo: jest.fn().mockResolvedValue({ videoId: 'video-1' }),
            findById: jest.fn(),
            markAsProcessing: jest.fn(),
            readMine: jest.fn(),
            countMine: jest.fn(),
            deleteById: jest.fn(),
            updateVisibility: jest.fn(),
            incrementViewCount: jest.fn(),
            markEncodingComplete: jest.fn(),
            markEncodingFailed: jest.fn(),
        };
        const feedVideoFileStorage: FeedVideoFileStoragePort = {
            generatePresignedUploadUrl: jest.fn().mockResolvedValue('https://upload.example/video'),
            deleteFile: jest.fn(),
        };
        const useCase = new GetUploadUrlUseCase(feedVideoCommand, feedVideoFileStorage);

        const result = await useCase.execute('user-1', 'Adopter', 'title', 'desc', ['tag']);

        expect(result.videoId).toBe('video-1');
        expect(result.uploadUrl).toBe('https://upload.example/video');
        expect(result.videoKey).toMatch(/^videos\/raw\/.+\.mp4$/);
        expect(feedVideoFileStorage.generatePresignedUploadUrl).toHaveBeenCalledWith(result.videoKey, 600);
        expect(feedVideoCommand.createPendingVideo).toHaveBeenCalledWith({
            userId: 'user-1',
            uploaderModel: 'Adopter',
            title: 'title',
            description: 'desc',
            tags: ['tag'],
            originalKey: result.videoKey,
        });
    });
});
