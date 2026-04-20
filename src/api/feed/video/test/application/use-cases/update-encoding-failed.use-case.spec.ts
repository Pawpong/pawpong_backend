import { UpdateEncodingFailedUseCase } from '../../../application/use-cases/update-encoding-failed.use-case';
import { FeedVideoCommandPort } from '../../../application/ports/feed-video-command.port';

function makeCommand(): FeedVideoCommandPort {
    return {
        createPendingVideo: jest.fn(),
        findById: jest.fn(),
        markAsProcessing: jest.fn(),
        readMine: jest.fn(),
        countMine: jest.fn(),
        deleteById: jest.fn(),
        updateVisibility: jest.fn(),
        incrementViewCount: jest.fn(),
        markEncodingComplete: jest.fn(),
        markEncodingFailed: jest.fn().mockResolvedValue(undefined),
    };
}

describe('인코딩 실패 처리 유스케이스', () => {
    it('실패 사유를 포트에 전달한다', async () => {
        const command = makeCommand();
        const useCase = new UpdateEncodingFailedUseCase(command);

        await useCase.execute('video-1', 'FFmpeg encoding error');

        expect(command.markEncodingFailed).toHaveBeenCalledWith('video-1', 'FFmpeg encoding error');
    });
});
