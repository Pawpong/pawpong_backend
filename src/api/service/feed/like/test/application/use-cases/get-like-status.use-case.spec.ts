import { GetLikeStatusUseCase } from '../../../application/use-cases/get-like-status.use-case';
import { FeedLikeResultMapperService } from '../../../domain/services/feed-like-result-mapper.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';

function makeManager(counter: any, like: any) {
    return {
        findVideoCounter: jest.fn().mockResolvedValue(counter),
        findUserLike: jest.fn().mockResolvedValue(like),
        createLike: jest.fn(),
        deleteLike: jest.fn(),
        updateVideoLikeCount: jest.fn(),
        readMyLikedVideos: jest.fn(),
        countMyLikedVideos: jest.fn(),
    };
}

describe('좋아요 상태 조회 유스케이스', () => {
    const resultMapper = new FeedLikeResultMapperService(new FeedVideoSummaryMapperService());

    it('좋아요를 누른 경우 isLiked: true를 반환한다', async () => {
        const useCase = new GetLikeStatusUseCase(
            makeManager({ id: 'counter-1', likeCount: 10 }, { id: 'like-1', videoId: 'v-1', userId: 'u-1' }),
            resultMapper,
        );

        const result = await useCase.execute('v-1', 'u-1');

        expect(result.isLiked).toBe(true);
        expect(result.likeCount).toBe(10);
    });

    it('좋아요를 누르지 않은 경우 isLiked: false를 반환한다', async () => {
        const useCase = new GetLikeStatusUseCase(makeManager({ id: 'counter-1', likeCount: 5 }, null), resultMapper);

        const result = await useCase.execute('v-1', 'u-1');

        expect(result.isLiked).toBe(false);
        expect(result.likeCount).toBe(5);
    });

    it('비디오 카운터가 없으면 likeCount가 0이다', async () => {
        const useCase = new GetLikeStatusUseCase(makeManager(null, null), resultMapper);

        const result = await useCase.execute('v-1', 'u-1');

        expect(result.likeCount).toBe(0);
    });
});
