import { BadRequestException } from '@nestjs/common';

import { DeleteVideoUseCase } from '../../../application/use-cases/delete-video.use-case';
import { FeedVideoCommandPolicyService } from '../../../domain/services/feed-video-command-policy.service';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';

describe('비디오 삭제 유스케이스', () => {
    const feedVideoCommand = {
        findById: jest.fn(),
        deleteById: jest.fn(),
    };
    const feedVideoFileStorage = {
        deleteFile: jest.fn().mockResolvedValue(undefined),
    };
    const cacheManager = {
        del: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new DeleteVideoUseCase(
        feedVideoCommand as any,
        new FeedVideoCommandPolicyService(),
        feedVideoFileStorage as any,
        cacheManager as any,
        new FeedCacheKeyService(),
    );

    const mockVideo = {
        id: 'video-1',
        uploadedById: 'breeder-1',
        isPublic: true,
        status: 'ready',
        originalKey: 'original/video-1.mp4',
        thumbnailKey: 'thumb/video-1.jpg',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        feedVideoFileStorage.deleteFile.mockResolvedValue(undefined);
        cacheManager.del.mockResolvedValue(undefined);
    });

    it('정상적으로 비디오를 삭제한다', async () => {
        feedVideoCommand.findById.mockResolvedValue(mockVideo);
        feedVideoCommand.deleteById.mockResolvedValue(undefined);

        const result = await useCase.execute('video-1', 'breeder-1');

        expect(result.success).toBe(true);
        expect(feedVideoCommand.deleteById).toHaveBeenCalledWith('video-1');
        expect(cacheManager.del).toHaveBeenCalled();
    });

    it('originalKey와 thumbnailKey 파일을 스토리지에서 삭제한다', async () => {
        feedVideoCommand.findById.mockResolvedValue(mockVideo);
        feedVideoCommand.deleteById.mockResolvedValue(undefined);

        await useCase.execute('video-1', 'breeder-1');

        expect(feedVideoFileStorage.deleteFile).toHaveBeenCalledWith('original/video-1.mp4');
        expect(feedVideoFileStorage.deleteFile).toHaveBeenCalledWith('thumb/video-1.jpg');
    });

    it('권한이 없는 사용자는 BadRequestException을 던진다', async () => {
        feedVideoCommand.findById.mockResolvedValue(mockVideo);

        await expect(useCase.execute('video-1', 'other-user')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('video-1', 'other-user')).rejects.toThrow('권한이 없습니다.');
        expect(feedVideoCommand.deleteById).not.toHaveBeenCalled();
    });

    it('비디오를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        feedVideoCommand.findById.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent-video', 'breeder-1')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('nonexistent-video', 'breeder-1')).rejects.toThrow('동영상을 찾을 수 없습니다.');
    });
});
