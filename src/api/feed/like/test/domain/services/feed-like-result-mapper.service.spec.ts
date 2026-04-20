import { FeedLikeResultMapperService } from '../../../domain/services/feed-like-result-mapper.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';

describe('FeedLikeResultMapperService', () => {
    const service = new FeedLikeResultMapperService(new FeedVideoSummaryMapperService());

    it('toggle 결과를 반환한다', () => {
        expect(service.buildToggleResponse(true, 10)).toEqual({ isLiked: true, likeCount: 10 });
    });

    it('status 결과를 반환한다', () => {
        expect(service.buildStatusResponse(false, 5)).toEqual({ isLiked: false, likeCount: 5 });
    });

    it('좋아요한 영상 목록에 pagination과 thumbnailUrl을 포함한다', async () => {
        const result = await service.buildMyLikedVideosResponse(
            [
                {
                    id: 'v-1',
                    title: 't',
                    thumbnailKey: 'k',
                    duration: 10,
                    viewCount: 1,
                    likeCount: 2,
                    uploadedBy: { id: 'u-1', name: 'A' },
                    createdAt: new Date(),
                } as any,
            ],
            1,
            10,
            1,
            (key?: string) => (key ? `https://cdn/${key}` : null),
        );
        expect(result.videos).toHaveLength(1);
        expect(result.videos[0].thumbnailUrl).toBe('https://cdn/k');
        expect(result.videos[0].uploadedBy?._id).toBe('u-1');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('thumbnailKey가 없으면 thumbnailUrl은 null', async () => {
        const result = await service.buildMyLikedVideosResponse(
            [
                {
                    id: 'v-1',
                    title: 't',
                    duration: 10,
                    viewCount: 1,
                    likeCount: 2,
                    uploadedBy: null,
                    createdAt: new Date(),
                } as any,
            ],
            1,
            10,
            1,
            () => null,
        );
        expect(result.videos[0].thumbnailUrl).toBeNull();
        expect(result.videos[0].uploadedBy).toBeNull();
    });
});
