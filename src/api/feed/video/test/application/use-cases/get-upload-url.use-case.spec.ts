import { GetUploadUrlUseCase } from '../../../application/use-cases/get-upload-url.use-case';
import { FeedVideoCommandPort } from '../../../application/ports/feed-video-command.port';
import { FeedVideoFileStoragePort } from '../../../application/ports/feed-video-file-storage.port';

function makeCommand(videoId = 'video-1'): FeedVideoCommandPort {
    return {
        createPendingVideo: jest.fn().mockResolvedValue({ videoId }),
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
}

function makeStorage(uploadUrl = 'https://storage.example.com/presigned'): FeedVideoFileStoragePort {
    return {
        generatePresignedUploadUrl: jest.fn().mockResolvedValue(uploadUrl),
        deleteFile: jest.fn(),
    };
}

describe('업로드 URL 생성 유스케이스', () => {
    it('업로드 URL과 videoId, videoKey를 반환한다', async () => {
        const useCase = new GetUploadUrlUseCase(makeCommand('video-1'), makeStorage());

        const result = await useCase.execute('user-1', 'Breeder', '제목');

        expect(result.videoId).toBe('video-1');
        expect(result.uploadUrl).toBe('https://storage.example.com/presigned');
        expect(result.videoKey).toMatch(/^videos\/raw\/.+\.mp4$/);
    });

    it('커맨드에 videoKey와 사용자 정보를 전달한다', async () => {
        const command = makeCommand();
        const useCase = new GetUploadUrlUseCase(command, makeStorage());

        await useCase.execute('user-1', 'Adopter', '제목', '설명', ['tag1']);

        expect(command.createPendingVideo).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user-1',
                uploaderModel: 'Adopter',
                title: '제목',
                description: '설명',
                tags: ['tag1'],
            }),
        );
    });

    it('tags가 없으면 빈 배열로 전달한다', async () => {
        const command = makeCommand();
        const useCase = new GetUploadUrlUseCase(command, makeStorage());

        await useCase.execute('user-1', 'Breeder', '제목');

        expect(command.createPendingVideo).toHaveBeenCalledWith(
            expect.objectContaining({ tags: [] }),
        );
    });
});
