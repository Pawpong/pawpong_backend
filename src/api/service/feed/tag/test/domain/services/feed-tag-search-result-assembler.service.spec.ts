import { FeedTagSearchResultAssemblerService } from '../../../domain/services/feed-tag-search-result-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';

describe('FeedTagSearchResultAssemblerService', () => {
    const service = new FeedTagSearchResultAssemblerService(new FeedVideoSummaryMapperService());

    it('영상 목록을 tag와 pagination과 함께 반환한다', async () => {
        const result = await service.buildSearchResponse(
            [
                {
                    id: 'v-1',
                    title: 't',
                    thumbnailKey: 'k',
                    duration: 10,
                    viewCount: 1,
                    likeCount: 2,
                    tags: ['강아지'],
                    uploadedBy: { id: 'u-1', name: 'A' },
                    createdAt: new Date(),
                } as any,
            ],
            '강아지',
            1,
            10,
            1,
            (key?: string) => (key ? `https://cdn/${key}` : null),
        );
        expect(result.tag).toBe('강아지');
        expect(result.videos[0].thumbnailUrl).toBe('https://cdn/k');
        expect(result.videos[0].uploadedBy?._id).toBe('u-1');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('빈 영상 배열도 처리한다', async () => {
        const result = await service.buildSearchResponse([], '강아지', 1, 10, 0, () => null);
        expect(result.videos).toEqual([]);
        expect(result.pagination.totalItems).toBe(0);
    });
});
