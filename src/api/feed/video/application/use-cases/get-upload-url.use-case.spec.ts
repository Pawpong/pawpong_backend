jest.mock('../../../../../common/storage/storage.service', () => ({
    StorageService: class StorageService {},
}));

import { GetUploadUrlUseCase } from './get-upload-url.use-case';
import { FeedVideoCommandPort } from '../ports/feed-video-command.port';

describe('GetUploadUrlUseCase', () => {
    it('업로드 URL과 pending 비디오 레코드를 함께 생성한다', async () => {
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
        const storageService = {
            generatePresignedUploadUrl: jest.fn().mockResolvedValue('https://upload.example/video'),
        };
        const useCase = new GetUploadUrlUseCase(feedVideoCommand, storageService as any);

        const result = await useCase.execute('user-1', 'Adopter', 'title', 'desc', ['tag']);

        expect(result.videoId).toBe('video-1');
        expect(result.uploadUrl).toBe('https://upload.example/video');
        expect(result.videoKey).toMatch(/^videos\/raw\/.+\.mp4$/);
        expect(storageService.generatePresignedUploadUrl).toHaveBeenCalledWith(result.videoKey, 600);
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
