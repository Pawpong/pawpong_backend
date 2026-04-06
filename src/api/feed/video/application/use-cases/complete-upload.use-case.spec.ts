import { BadRequestException } from '@nestjs/common';

import { CompleteUploadUseCase } from './complete-upload.use-case';
import { FeedVideoCommandPort } from '../ports/feed-video-command.port';
import { FeedVideoCommandPolicyService } from '../../domain/services/feed-video-command-policy.service';
import { VideoStatus } from '../../../../../schema/video.schema';

describe('CompleteUploadUseCase', () => {
    const createCommand = (status: VideoStatus = VideoStatus.PENDING): FeedVideoCommandPort => ({
        createPendingVideo: jest.fn(),
        findById: jest.fn().mockResolvedValue({
            id: 'video-1',
            uploadedById: 'user-1',
            title: 'title',
            status,
            originalKey: 'videos/raw/video-1.mp4',
            thumbnailKey: 'videos/thumb/video-1.jpg',
            duration: 0,
            viewCount: 0,
            isPublic: true,
            createdAt: new Date('2026-04-06T00:00:00.000Z'),
        }),
        markAsProcessing: jest.fn(),
        readMine: jest.fn(),
        countMine: jest.fn(),
        deleteById: jest.fn(),
        updateVisibility: jest.fn(),
        incrementViewCount: jest.fn(),
        markEncodingComplete: jest.fn(),
        markEncodingFailed: jest.fn(),
    });

    it('pending 영상이면 processing으로 전환하고 인코딩 큐에 넣는다', async () => {
        const feedVideoCommand = createCommand();
        const videoQueue = {
            add: jest.fn().mockResolvedValue(undefined),
        };
        const useCase = new CompleteUploadUseCase(
            feedVideoCommand,
            new FeedVideoCommandPolicyService(),
            videoQueue as any,
        );

        await expect(useCase.execute('video-1', 'user-1')).resolves.toEqual({
            status: VideoStatus.PROCESSING,
        });
        expect(feedVideoCommand.markAsProcessing).toHaveBeenCalledWith('video-1');
        expect(videoQueue.add).toHaveBeenCalledWith(
            'encode-hls',
            {
                videoId: 'video-1',
                originalKey: 'videos/raw/video-1.mp4',
            },
            {
                priority: 1,
            },
        );
    });

    it('pending 상태가 아니면 예외를 던진다', async () => {
        const feedVideoCommand = createCommand(VideoStatus.READY);
        const useCase = new CompleteUploadUseCase(
            feedVideoCommand,
            new FeedVideoCommandPolicyService(),
            { add: jest.fn() } as any,
        );

        await expect(useCase.execute('video-1', 'user-1')).rejects.toBeInstanceOf(BadRequestException);
    });
});
