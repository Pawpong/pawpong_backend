import { BadRequestException } from '@nestjs/common';

import { ToggleVideoVisibilityUseCase } from '../../../application/use-cases/toggle-video-visibility.use-case';
import { FeedVideoCommandPolicyService } from '../../../domain/services/feed-video-command-policy.service';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';

describe('비디오 공개/비공개 전환 유스케이스', () => {
    const feedVideoCommand = {
        findById: jest.fn(),
        updateVisibility: jest.fn(),
    };
    const cacheManager = {
        del: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new ToggleVideoVisibilityUseCase(
        feedVideoCommand as any,
        new FeedVideoCommandPolicyService(),
        cacheManager as any,
        new FeedCacheKeyService(),
    );

    const mockPublicVideo = {
        id: 'video-1',
        uploadedById: 'breeder-1',
        isPublic: true,
        status: 'ready',
        originalKey: 'original/video-1.mp4',
        thumbnailKey: 'thumb/video-1.jpg',
    };

    const mockPrivateVideo = {
        ...mockPublicVideo,
        isPublic: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        cacheManager.del.mockResolvedValue(undefined);
    });

    it('공개 상태를 비공개로 전환한다', async () => {
        feedVideoCommand.findById.mockResolvedValue(mockPublicVideo);
        feedVideoCommand.updateVisibility.mockResolvedValue(undefined);

        const result = await useCase.execute('video-1', 'breeder-1');

        expect(result.isPublic).toBe(false);
        expect(feedVideoCommand.updateVisibility).toHaveBeenCalledWith('video-1', false);
        expect(cacheManager.del).toHaveBeenCalled();
    });

    it('비공개 상태를 공개로 전환한다', async () => {
        feedVideoCommand.findById.mockResolvedValue(mockPrivateVideo);
        feedVideoCommand.updateVisibility.mockResolvedValue(undefined);

        const result = await useCase.execute('video-1', 'breeder-1');

        expect(result.isPublic).toBe(true);
        expect(feedVideoCommand.updateVisibility).toHaveBeenCalledWith('video-1', true);
    });

    it('권한이 없는 사용자는 BadRequestException을 던진다', async () => {
        feedVideoCommand.findById.mockResolvedValue(mockPublicVideo);

        await expect(useCase.execute('video-1', 'other-user')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('video-1', 'other-user')).rejects.toThrow('권한이 없습니다.');
        expect(feedVideoCommand.updateVisibility).not.toHaveBeenCalled();
    });

    it('비디오를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        feedVideoCommand.findById.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent-video', 'breeder-1')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('nonexistent-video', 'breeder-1')).rejects.toThrow('동영상을 찾을 수 없습니다.');
    });
});
