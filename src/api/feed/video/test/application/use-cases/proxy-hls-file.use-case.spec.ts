import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { ProxyHlsFileUseCase } from '../../../application/use-cases/proxy-hls-file.use-case';
import { FeedVideoStreamingService } from '../../../domain/services/feed-video-streaming.service';
import { FeedVideoStreamPort } from '../../../application/ports/feed-video-stream.port';

function makeStream(overrides: Partial<FeedVideoStreamPort> = {}): FeedVideoStreamPort {
    return {
        readFile: jest.fn().mockResolvedValue(Buffer.from('file-content')),
        getTextCache: jest.fn().mockResolvedValue(null),
        setTextCache: jest.fn().mockResolvedValue(undefined),
        getBinaryCache: jest.fn().mockResolvedValue(null),
        setBinaryCache: jest.fn().mockResolvedValue(undefined),
        hasCache: jest.fn(),
        ...overrides,
    };
}

describe('HLS 파일 프록시 유스케이스', () => {
    const streamingService = new FeedVideoStreamingService();

    it('.ts 세그먼트 캐시가 있으면 HIT로 반환한다', async () => {
        const stream = makeStream({
            getBinaryCache: jest.fn().mockResolvedValue(Buffer.from('cached-segment')),
        });
        const useCase = new ProxyHlsFileUseCase(stream, streamingService);

        const result = await useCase.execute('video-1', 'stream_480p_001.ts');

        expect(result.cacheStatus).toBe('HIT');
        expect(result.contentType).toBe('video/mp2t');
    });

    it('.ts 세그먼트 캐시가 없으면 파일을 읽고 MISS로 반환한다', async () => {
        const stream = makeStream();
        const useCase = new ProxyHlsFileUseCase(stream, streamingService);

        const result = await useCase.execute('video-1', 'stream_480p_001.ts');

        expect(result.cacheStatus).toBe('MISS');
        expect(stream.readFile).toHaveBeenCalled();
        expect(stream.setBinaryCache).toHaveBeenCalled();
    });

    it('.m3u8 매니페스트는 텍스트 캐시를 사용한다', async () => {
        const stream = makeStream({
            getTextCache: jest.fn().mockResolvedValue('#EXTM3U\n...'),
        });
        const useCase = new ProxyHlsFileUseCase(stream, streamingService);

        const result = await useCase.execute('video-1', 'master.m3u8');

        expect(result.cacheStatus).toBe('HIT');
        expect(result.contentType).toBe('application/vnd.apple.mpegurl');
        expect(result.body).toContain('#EXTM3U');
    });

    it('.m3u8 매니페스트 캐시 미스 시 파일을 읽어 반환한다', async () => {
        const stream = makeStream({
            readFile: jest.fn().mockResolvedValue(Buffer.from('#EXTM3U\n#EXT-X-VERSION:3')),
        });
        const useCase = new ProxyHlsFileUseCase(stream, streamingService);

        const result = await useCase.execute('video-1', 'playlist.m3u8');

        expect(result.cacheStatus).toBe('MISS');
        expect(typeof result.body).toBe('string');
        expect(stream.setTextCache).toHaveBeenCalled();
    });

    it('허용되지 않은 확장자는 DomainValidationError를 던진다', async () => {
        const useCase = new ProxyHlsFileUseCase(makeStream(), streamingService);

        await expect(useCase.execute('video-1', 'evil.exe')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('비도메인 에러는 DomainValidationError로 래핑한다', async () => {
        const stream = makeStream({
            readFile: jest.fn().mockRejectedValue(new Error('S3 unreachable')),
        });
        const useCase = new ProxyHlsFileUseCase(stream, streamingService);

        await expect(useCase.execute('video-1', 'stream_480p_001.ts')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
