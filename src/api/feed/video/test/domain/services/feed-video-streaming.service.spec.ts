import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { FeedVideoStreamingService } from '../../../domain/services/feed-video-streaming.service';

describe('FeedVideoStreamingService', () => {
    const service = new FeedVideoStreamingService();

    describe('getProxyTarget', () => {
        it('.ts 확장자는 binary 캐시와 video/mp2t 타입을 반환한다', () => {
            const result = service.getProxyTarget('v-1', 'stream_480p_001.ts');
            expect(result.cacheKind).toBe('binary');
            expect(result.contentType).toBe('video/mp2t');
            expect(result.fileKey).toBe('videos/hls/v-1/stream_480p_001.ts');
            expect(result.cacheKey).toBe('hls:v-1:stream_480p_001.ts');
        });

        it('.m3u8 확장자는 text 캐시와 application/vnd.apple.mpegurl 타입을 반환한다', () => {
            const result = service.getProxyTarget('v-1', 'master.m3u8');
            expect(result.cacheKind).toBe('text');
            expect(result.contentType).toBe('application/vnd.apple.mpegurl');
        });

        it('허용되지 않은 확장자는 DomainValidationError를 던진다', () => {
            expect(() => service.getProxyTarget('v-1', 'evil.exe')).toThrow(DomainValidationError);
            expect(() => service.getProxyTarget('v-1', 'no-extension')).toThrow(DomainValidationError);
        });
    });

    describe('getPreloadTargets', () => {
        it('기본 3해상도 × 3세그먼트 = 9개를 반환한다', () => {
            const targets = service.getPreloadTargets('v-1');
            expect(targets).toHaveLength(9);
        });

        it('커스텀 해상도를 지정할 수 있다', () => {
            const targets = service.getPreloadTargets('v-1', [720]);
            expect(targets).toHaveLength(3);
            expect(targets[0].filename).toBe('stream_720p_000.ts');
        });
    });

    describe('getPrefetchTargets', () => {
        it('기본 3해상도 × count(5) = 15개를 반환한다', () => {
            const targets = service.getPrefetchTargets('v-1', 0);
            expect(targets).toHaveLength(15);
        });

        it('currentSegment부터 count개만큼 이어서 생성한다', () => {
            const targets = service.getPrefetchTargets('v-1', 5, 2, [360]);
            expect(targets).toHaveLength(2);
            expect(targets[0].filename).toBe('stream_360p_005.ts');
            expect(targets[1].filename).toBe('stream_360p_006.ts');
        });

        it('세그먼트 번호는 3자리로 0 패딩된다', () => {
            const targets = service.getPrefetchTargets('v-1', 0, 1, [480]);
            expect(targets[0].filename).toBe('stream_480p_000.ts');
        });
    });
});
