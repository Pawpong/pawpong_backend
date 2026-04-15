import { ProxyHlsFileUseCase } from '../../../../video/application/use-cases/proxy-hls-file.use-case';
import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { FeedVideoStreamPort } from '../../../../video/application/ports/feed-video-stream.port';
import { FeedVideoStreamingService } from '../../../../video/domain/services/feed-video-streaming.service';

describe('스트리밍 파일 프록시 유스케이스', () => {
    const createStreamPort = (): jest.Mocked<FeedVideoStreamPort> => ({
        readFile: jest.fn(),
        getTextCache: jest.fn(),
        setTextCache: jest.fn(),
        getBinaryCache: jest.fn(),
        setBinaryCache: jest.fn(),
        hasCache: jest.fn(),
    });

    it('세그먼트 캐시 히트 시 저장소 조회 없이 버퍼를 반환한다', async () => {
        const feedVideoStream = createStreamPort();
        feedVideoStream.getBinaryCache.mockResolvedValue(Buffer.from('segment'));
        const useCase = new ProxyHlsFileUseCase(feedVideoStream, new FeedVideoStreamingService());

        const result = await useCase.execute('video-1', 'stream_360p_000.ts');

        expect(result.cacheStatus).toBe('HIT');
        expect(result.contentType).toBe('video/mp2t');
        expect(result.body).toEqual(Buffer.from('segment'));
        expect(feedVideoStream.readFile).not.toHaveBeenCalled();
    });

    it('매니페스트 캐시 미스 시 파일을 읽어 텍스트 캐시에 저장한다', async () => {
        const feedVideoStream = createStreamPort();
        feedVideoStream.getTextCache.mockResolvedValue(null);
        feedVideoStream.readFile.mockResolvedValue(Buffer.from('#EXTM3U'));
        const useCase = new ProxyHlsFileUseCase(feedVideoStream, new FeedVideoStreamingService());

        const result = await useCase.execute('video-1', 'master.m3u8');

        expect(result).toEqual({
            body: '#EXTM3U',
            contentType: 'application/vnd.apple.mpegurl',
            cacheControl: 'public, max-age=3600',
            cacheStatus: 'MISS',
        });
        expect(feedVideoStream.setTextCache).toHaveBeenCalledWith('hls:video-1:master.m3u8', '#EXTM3U', 1800);
    });

    it('허용되지 않은 확장자는 예외를 던진다', async () => {
        const useCase = new ProxyHlsFileUseCase(createStreamPort(), new FeedVideoStreamingService());

        await expect(useCase.execute('video-1', 'malicious.mp4')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('저장소 조회 실패는 사용자용 잘못된 요청 예외로 변환한다', async () => {
        const feedVideoStream = createStreamPort();
        feedVideoStream.getTextCache.mockResolvedValue(null);
        feedVideoStream.readFile.mockRejectedValue(new Error('s3 failed'));
        const useCase = new ProxyHlsFileUseCase(feedVideoStream, new FeedVideoStreamingService());

        await expect(useCase.execute('video-1', 'master.m3u8')).rejects.toBeInstanceOf(DomainValidationError);
        await expect(useCase.execute('video-1', 'master.m3u8')).rejects.toThrow('파일을 가져올 수 없습니다.');
    });
});
