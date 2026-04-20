import { FeedVideoPublicListAssemblerService } from '../../../domain/services/feed-video-public-list-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { VideoStatus } from '../../../../../../common/enum/video-status.enum';

function makeVideo(id: string) {
    return {
        id,
        title: `t-${id}`,
        status: VideoStatus.READY,
        thumbnailKey: `thumb/${id}.jpg`,
        duration: 30,
        viewCount: 100,
        likeCount: 10,
        uploadedBy: { id: 'u-1', name: 'A' },
        createdAt: new Date('2026-01-01'),
    } as any;
}

describe('FeedVideoPublicListAssemblerService', () => {
    const service = new FeedVideoPublicListAssemblerService(new FeedVideoSummaryMapperService());
    const signedUrl = async (key: string) => `https://cdn/${key}`;

    describe('buildFeedResult', () => {
        it('영상 리스트를 pagination과 함께 반환한다', async () => {
            const result = await service.buildFeedResult([makeVideo('v-1'), makeVideo('v-2')], 1, 10, 2, signedUrl);
            expect(result.items).toHaveLength(2);
            expect(result.items[0].thumbnailUrl).toBe('https://cdn/thumb/v-1.jpg');
            expect(result.pagination.totalItems).toBe(2);
        });

        it('빈 영상 배열도 처리한다', async () => {
            const result = await service.buildFeedResult([], 1, 10, 0, signedUrl);
            expect(result.items).toEqual([]);
        });
    });

    describe('buildPopularResult', () => {
        it('uploader와 썸네일이 포함된 인기 영상 리스트를 반환한다', async () => {
            const result = await service.buildPopularResult([makeVideo('v-1')], signedUrl);
            expect(result).toHaveLength(1);
            expect(result[0].videoId).toBe('v-1');
            expect(result[0].thumbnailUrl).toBe('https://cdn/thumb/v-1.jpg');
            expect(result[0].uploadedBy?._id).toBe('u-1');
        });
    });
});
