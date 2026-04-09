import { BadRequestException } from '@nestjs/common';

import { ToggleLikeUseCase } from './toggle-like.use-case';
import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FeedVideoSummaryPresentationService } from '../../../domain/services/feed-video-summary-presentation.service';
import { FeedLikeManagerPort } from '../ports/feed-like-manager.port';
import { FeedLikePolicyService } from '../../domain/services/feed-like-policy.service';
import { FeedLikePresentationService } from '../../domain/services/feed-like-presentation.service';

describe('좋아요 전환 유스케이스', () => {
    const createManager = (): FeedLikeManagerPort => ({
        findVideoCounter: jest.fn().mockResolvedValue({
            id: 'video-1',
            likeCount: 4,
        }),
        findUserLike: jest.fn().mockResolvedValue(null),
        createLike: jest.fn().mockResolvedValue(undefined),
        deleteLike: jest.fn().mockResolvedValue(undefined),
        updateVideoLikeCount: jest.fn().mockResolvedValue(5),
        readMyLikedVideos: jest.fn(),
        countMyLikedVideos: jest.fn(),
    });

    it('좋아요가 없으면 새 좋아요를 추가한다', async () => {
        const manager = createManager();
        const cacheManager = { del: jest.fn().mockResolvedValue(undefined) };
        const useCase = new ToggleLikeUseCase(
            manager,
            new FeedLikePolicyService(),
            new FeedLikePresentationService(new FeedVideoSummaryPresentationService()),
            cacheManager as any,
            new FeedCacheKeyService(),
        );

        await expect(useCase.execute('video-1', 'user-1', 'Adopter')).resolves.toEqual({
            isLiked: true,
            likeCount: 5,
        });
        expect(manager.createLike).toHaveBeenCalledWith({
            videoId: 'video-1',
            userId: 'user-1',
            userModel: 'Adopter',
        });
        expect(cacheManager.del).toHaveBeenCalledWith('video:meta:video-1');
    });

    it('동영상이 없으면 예외를 던진다', async () => {
        const manager = createManager();
        manager.findVideoCounter = jest.fn().mockResolvedValue(null);

        const useCase = new ToggleLikeUseCase(
            manager,
            new FeedLikePolicyService(),
            new FeedLikePresentationService(new FeedVideoSummaryPresentationService()),
            { del: jest.fn() } as any,
            new FeedCacheKeyService(),
        );

        await expect(useCase.execute('video-1', 'user-1', 'Adopter')).rejects.toBeInstanceOf(BadRequestException);
    });
});
