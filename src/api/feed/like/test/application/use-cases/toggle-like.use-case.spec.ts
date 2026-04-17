import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { ToggleLikeUseCase } from '../../../application/use-cases/toggle-like.use-case';
import { FeedLikePolicyService } from '../../../domain/services/feed-like-policy.service';
import { FeedLikeResultMapperService } from '../../../domain/services/feed-like-result-mapper.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';
import { FeedLikeManagerPort } from '../../../application/ports/feed-like-manager.port';

const counter = { id: 'counter-1', likeCount: 10 };
const existingLike = { id: 'like-1', videoId: 'video-1', userId: 'user-1' };

function makeManager(overrides: Partial<{
    counter: any;
    like: any;
    updatedCount: number;
}> = {}): FeedLikeManagerPort {
    const { counter: c = counter, like = null, updatedCount = 9 } = overrides;
    return {
        findVideoCounter: jest.fn().mockResolvedValue(c),
        findUserLike: jest.fn().mockResolvedValue(like),
        createLike: jest.fn().mockResolvedValue(undefined),
        deleteLike: jest.fn().mockResolvedValue(undefined),
        updateVideoLikeCount: jest.fn().mockResolvedValue(updatedCount),
        readMyLikedVideos: jest.fn(),
        countMyLikedVideos: jest.fn(),
    };
}

function makeCache() {
    return { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
}

describe('좋아요 토글 유스케이스', () => {
    const policy = new FeedLikePolicyService();
    const resultMapper = new FeedLikeResultMapperService(new FeedVideoSummaryMapperService());
    const cacheKeyService = new FeedCacheKeyService();

    it('좋아요가 없으면 좋아요를 추가하고 isLiked: true를 반환한다', async () => {
        const useCase = new ToggleLikeUseCase(makeManager({ like: null, updatedCount: 11 }), policy, resultMapper, makeCache() as any, cacheKeyService);

        const result = await useCase.execute('video-1', 'user-1', 'Adopter');

        expect(result.isLiked).toBe(true);
        expect(result.likeCount).toBe(11);
    });

    it('좋아요가 있으면 좋아요를 취소하고 isLiked: false를 반환한다', async () => {
        const useCase = new ToggleLikeUseCase(makeManager({ like: existingLike, updatedCount: 9 }), policy, resultMapper, makeCache() as any, cacheKeyService);

        const result = await useCase.execute('video-1', 'user-1', 'Adopter');

        expect(result.isLiked).toBe(false);
        expect(result.likeCount).toBe(9);
    });

    it('비디오 카운터가 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new ToggleLikeUseCase(makeManager({ counter: null }), policy, resultMapper, makeCache() as any, cacheKeyService);

        await expect(useCase.execute('not-found', 'user-1', 'Adopter')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('토글 후 캐시를 삭제한다', async () => {
        const cache = makeCache();
        const useCase = new ToggleLikeUseCase(makeManager(), policy, resultMapper, cache as any, cacheKeyService);

        await useCase.execute('video-1', 'user-1', 'Breeder');

        expect(cache.del).toHaveBeenCalled();
    });
});
