import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { VideoStatus } from '../../../../../../common/enum/video-status.enum';
import { CompleteUploadUseCase } from '../../../application/use-cases/complete-upload.use-case';
import { FeedVideoCommandPolicyService } from '../../../domain/services/feed-video-command-policy.service';
import { FeedVideoCommandPort, FeedVideoCommandSnapshot } from '../../../application/ports/feed-video-command.port';

function makeVideoSnapshot(overrides: Partial<FeedVideoCommandSnapshot> = {}): FeedVideoCommandSnapshot {
    return {
        id: 'video-1',
        uploadedById: 'user-1',
        title: '제목',
        status: VideoStatus.PENDING,
        originalKey: 'videos/raw/video-1.mp4',
        duration: 0,
        viewCount: 0,
        isPublic: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

function makeCommand(video: FeedVideoCommandSnapshot | null): FeedVideoCommandPort {
    return {
        createPendingVideo: jest.fn(),
        findById: jest.fn().mockResolvedValue(video),
        markAsProcessing: jest.fn().mockResolvedValue(undefined),
        readMine: jest.fn(),
        countMine: jest.fn(),
        deleteById: jest.fn(),
        updateVisibility: jest.fn(),
        incrementViewCount: jest.fn(),
        markEncodingComplete: jest.fn(),
        markEncodingFailed: jest.fn(),
    };
}

function makeQueue() {
    return { add: jest.fn().mockResolvedValue(undefined) };
}

describe('업로드 완료 처리 유스케이스', () => {
    const policy = new FeedVideoCommandPolicyService();

    it('업로드 완료 시 processing 상태로 전환하고 인코딩 큐에 추가한다', async () => {
        const queue = makeQueue();
        const command = makeCommand(makeVideoSnapshot());
        const useCase = new CompleteUploadUseCase(command, policy, queue as any);

        const result = await useCase.execute('video-1', 'user-1');

        expect(result.status).toBe(VideoStatus.PROCESSING);
        expect(command.markAsProcessing).toHaveBeenCalledWith('video-1');
        expect(queue.add).toHaveBeenCalledWith(
            'encode-hls',
            expect.objectContaining({ videoId: 'video-1', originalKey: 'videos/raw/video-1.mp4' }),
            expect.objectContaining({ priority: 1 }),
        );
    });

    it('비디오가 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new CompleteUploadUseCase(makeCommand(null), policy, makeQueue() as any);

        await expect(useCase.execute('not-found', 'user-1')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('다른 사용자의 비디오는 DomainValidationError를 던진다', async () => {
        const useCase = new CompleteUploadUseCase(makeCommand(makeVideoSnapshot()), policy, makeQueue() as any);

        await expect(useCase.execute('video-1', 'other-user')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('PENDING 상태가 아니면 DomainValidationError를 던진다', async () => {
        const useCase = new CompleteUploadUseCase(
            makeCommand(makeVideoSnapshot({ status: VideoStatus.PROCESSING })),
            policy,
            makeQueue() as any,
        );

        await expect(useCase.execute('video-1', 'user-1')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
