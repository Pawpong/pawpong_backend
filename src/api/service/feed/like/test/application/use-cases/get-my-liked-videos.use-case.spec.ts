import { GetMyLikedVideosUseCase } from '../../../application/use-cases/get-my-liked-videos.use-case';
import { FeedLikeResultMapperService } from '../../../domain/services/feed-like-result-mapper.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { FeedLikeManagerPort, FeedLikeVideoSnapshot } from '../../../application/ports/feed-like-manager.port';

function makeVideoSnapshot(overrides: Partial<FeedLikeVideoSnapshot> = {}): FeedLikeVideoSnapshot {
    return {
        id: 'video-1',
        title: '강아지 영상',
        thumbnailKey: 'thumb/video-1.jpg',
        duration: 120,
        viewCount: 300,
        likeCount: 50,
        uploadedBy: { id: 'user-1', name: '브리더A' },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

function makeManager(videos: FeedLikeVideoSnapshot[] = [], total = 0): FeedLikeManagerPort {
    return {
        findVideoCounter: jest.fn(),
        findUserLike: jest.fn(),
        createLike: jest.fn(),
        deleteLike: jest.fn(),
        updateVideoLikeCount: jest.fn(),
        readMyLikedVideos: jest.fn().mockResolvedValue(videos),
        countMyLikedVideos: jest.fn().mockResolvedValue(total),
    };
}

function makeAssetUrl() {
    return {
        generateSignedUrl: jest.fn().mockReturnValue('https://cdn.example.com/thumb.jpg'),
    };
}

describe('내가 좋아요한 영상 목록 유스케이스', () => {
    const resultMapper = new FeedLikeResultMapperService(new FeedVideoSummaryMapperService());

    it('좋아요한 영상 목록을 반환한다', async () => {
        const useCase = new GetMyLikedVideosUseCase(
            makeManager([makeVideoSnapshot()], 1),
            resultMapper,
            makeAssetUrl() as any,
        );

        const result = await useCase.execute('user-1');

        expect(result.videos).toHaveLength(1);
        expect(result.videos[0].title).toBe('강아지 영상');
    });

    it('페이지네이션 정보를 포함한다', async () => {
        const useCase = new GetMyLikedVideosUseCase(
            makeManager([makeVideoSnapshot()], 25),
            resultMapper,
            makeAssetUrl() as any,
        );

        const result = await useCase.execute('user-1', 2, 10);

        expect(result.pagination.currentPage).toBe(2);
        expect(result.pagination.pageSize).toBe(10);
        expect(result.pagination.totalItems).toBe(25);
    });

    it('좋아요한 영상이 없으면 빈 목록을 반환한다', async () => {
        const useCase = new GetMyLikedVideosUseCase(makeManager([], 0), resultMapper, makeAssetUrl() as any);

        const result = await useCase.execute('user-1');

        expect(result.videos).toEqual([]);
    });

    it('thumbnailKey가 없으면 thumbnailUrl이 null이다', async () => {
        const video = makeVideoSnapshot({ thumbnailKey: undefined });
        const useCase = new GetMyLikedVideosUseCase(makeManager([video], 1), resultMapper, makeAssetUrl() as any);

        const result = await useCase.execute('user-1');

        expect(result.videos[0].thumbnailUrl).toBeNull();
    });
});
