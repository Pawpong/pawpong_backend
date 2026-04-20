import { FeedVideoLibraryAssemblerService } from '../../../domain/services/feed-video-library-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { VideoStatus } from '../../../../../../common/enum/video-status.enum';

describe('FeedVideoLibraryAssemblerService', () => {
    const service = new FeedVideoLibraryAssemblerService(new FeedVideoSummaryMapperService());
    const signedUrl = jest.fn(async (key: string) => `https://cdn/${key}`);

    beforeEach(() => {
        signedUrl.mockClear();
    });

    it('내 영상 목록을 pagination과 함께 반환한다', async () => {
        const result = await service.buildMyVideosResult(
            [
                {
                    id: 'v-1',
                    uploadedById: 'u-1',
                    title: 't',
                    status: VideoStatus.READY,
                    originalKey: 'raw/v-1.mp4',
                    thumbnailKey: 'thumb/v-1.jpg',
                    duration: 120,
                    viewCount: 10,
                    isPublic: true,
                    createdAt: new Date(),
                } as any,
            ],
            1,
            10,
            1,
            signedUrl,
        );
        expect(result.items).toHaveLength(1);
        expect(result.items[0].thumbnailUrl).toBe('https://cdn/thumb/v-1.jpg');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('thumbnailKey가 없으면 thumbnailUrl은 null', async () => {
        const result = await service.buildMyVideosResult(
            [
                {
                    id: 'v-1',
                    uploadedById: 'u-1',
                    title: 't',
                    status: VideoStatus.PENDING,
                    originalKey: 'raw/v-1.mp4',
                    duration: 0,
                    viewCount: 0,
                    isPublic: true,
                    createdAt: new Date(),
                } as any,
            ],
            1,
            10,
            1,
            signedUrl,
        );
        expect(result.items[0].thumbnailUrl).toBeNull();
        expect(signedUrl).not.toHaveBeenCalled();
    });
});
