import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { VideoStatus } from '../../../../../schema/video.schema';
import { FeedVideoCommandPolicyService } from '../../domain/services/feed-video-command-policy.service';
import { FEED_VIDEO_COMMAND_PORT, type FeedVideoCommandPort } from '../ports/feed-video-command.port';

@Injectable()
export class CompleteUploadUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND_PORT)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        private readonly feedVideoCommandPolicyService: FeedVideoCommandPolicyService,
        @InjectQueue('video')
        private readonly videoQueue: Queue,
    ) {}

    async execute(videoId: string, userId: string): Promise<{ status: VideoStatus }> {
        const video = this.feedVideoCommandPolicyService.requireVideo(await this.feedVideoCommand.findById(videoId));
        this.feedVideoCommandPolicyService.ensureOwner(video, userId);
        this.feedVideoCommandPolicyService.ensurePending(video);

        await this.feedVideoCommand.markAsProcessing(videoId);
        await this.videoQueue.add(
            'encode-hls',
            {
                videoId: video.id,
                originalKey: video.originalKey,
            },
            {
                priority: 1,
            },
        );

        return { status: VideoStatus.PROCESSING };
    }
}
