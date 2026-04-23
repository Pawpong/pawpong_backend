import { FeedVideoMetaAssemblerService } from '../../../domain/services/feed-video-meta-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { VideoStatus } from '../../../../../../common/enum/video-status.enum';

describe('FeedVideoMetaAssemblerService', () => {
    const service = new FeedVideoMetaAssemblerService(new FeedVideoSummaryMapperService());
    const signedUrl = async (key: string) => (key ? `https://cdn/${key}` : '');

    describe('buildPendingMetaResult', () => {
        it('ID, status, title, failureReason을 포함한다', () => {
            const result = service.buildPendingMetaResult({
                id: 'v-1',
                title: '제목',
                status: VideoStatus.FAILED,
                failureReason: 'encoding error',
            } as any);
            expect(result).toEqual({
                videoId: 'v-1',
                status: VideoStatus.FAILED,
                title: '제목',
                failureReason: 'encoding error',
            });
        });
    });

    describe('buildMetaResult', () => {
        it('playUrl과 thumbnailUrl, uploader, 메타 필드를 구성한다', async () => {
            const result = await service.buildMetaResult(
                {
                    id: 'v-1',
                    title: 't',
                    description: 'd',
                    status: VideoStatus.READY,
                    hlsManifestKey: 'hls/v-1.m3u8',
                    thumbnailKey: 'thumb/v-1.jpg',
                    duration: 120,
                    width: 1920,
                    height: 1080,
                    viewCount: 10,
                    likeCount: 5,
                    commentCount: 2,
                    tags: ['t1'],
                    uploadedBy: { id: 'u-1', name: 'A' },
                    createdAt: new Date(),
                } as any,
                signedUrl,
            );
            expect(result.playUrl).toBe('https://cdn/hls/v-1.m3u8');
            expect(result.thumbnailUrl).toBe('https://cdn/thumb/v-1.jpg');
            expect(result.uploadedBy?._id).toBe('u-1');
        });

        it('hlsManifestKey/thumbnailKey가 없으면 빈 문자열 URL', async () => {
            const result = await service.buildMetaResult(
                {
                    id: 'v-1',
                    title: 't',
                    status: VideoStatus.READY,
                    duration: 0,
                    width: 0,
                    height: 0,
                    viewCount: 0,
                    likeCount: 0,
                    commentCount: 0,
                    tags: [],
                    uploadedBy: null,
                    createdAt: new Date(),
                } as any,
                signedUrl,
            );
            expect(result.playUrl).toBe('');
            expect(result.thumbnailUrl).toBe('');
        });
    });
});
