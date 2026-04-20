import { PrefetchAllQualitySegmentsUseCase } from '../../../application/use-cases/prefetch-all-quality-segments.use-case';
import { FeedVideoStreamingService } from '../../../domain/services/feed-video-streaming.service';
import { FeedVideoStreamPort } from '../../../application/ports/feed-video-stream.port';

function makeStream(overrides: Partial<FeedVideoStreamPort> = {}): FeedVideoStreamPort {
    return {
        readFile: jest.fn().mockResolvedValue(Buffer.from('segment-data')),
        getTextCache: jest.fn(),
        setTextCache: jest.fn(),
        getBinaryCache: jest.fn(),
        setBinaryCache: jest.fn().mockResolvedValue(undefined),
        hasCache: jest.fn().mockResolvedValue(false),
        ...overrides,
    };
}

describe('전체 품질 세그먼트 프리페치 유스케이스', () => {
    const streamingService = new FeedVideoStreamingService();

    it('기본 해상도 3개 × 기본 count 5 = 15개 타겟을 반환한다', async () => {
        const stream = makeStream();
        const useCase = new PrefetchAllQualitySegmentsUseCase(stream, streamingService);

        const count = await useCase.execute('video-1', 0);

        expect(count).toBe(15);
        expect(stream.setBinaryCache).toHaveBeenCalledTimes(15);
    });

    it('캐시가 이미 있는 세그먼트는 읽지 않는다', async () => {
        const stream = makeStream({
            hasCache: jest.fn().mockResolvedValue(true),
        });
        const useCase = new PrefetchAllQualitySegmentsUseCase(stream, streamingService);

        await useCase.execute('video-1', 0);

        expect(stream.readFile).not.toHaveBeenCalled();
        expect(stream.setBinaryCache).not.toHaveBeenCalled();
    });

    it('custom resolutions과 count를 지정할 수 있다', async () => {
        const stream = makeStream();
        const useCase = new PrefetchAllQualitySegmentsUseCase(stream, streamingService);

        const count = await useCase.execute('video-1', 5, 2, [720]);

        expect(count).toBe(2);
    });

    it('파일 읽기 실패 시 에러를 삼키고 계속 진행한다', async () => {
        const stream = makeStream({
            readFile: jest.fn().mockRejectedValue(new Error('S3 unreachable')),
        });
        const useCase = new PrefetchAllQualitySegmentsUseCase(stream, streamingService);

        await expect(useCase.execute('video-1', 0, 1, [480])).resolves.toBe(1);
    });
});
