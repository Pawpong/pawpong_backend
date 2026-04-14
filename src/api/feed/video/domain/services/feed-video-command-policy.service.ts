import { BadRequestException, Injectable } from '@nestjs/common';

import { FeedVideoCommandSnapshot } from '../../application/ports/feed-video-command.port';
import { VideoStatus } from '../../../../../common/enum/video-status.enum';

@Injectable()
export class FeedVideoCommandPolicyService {
    requireVideo(video: FeedVideoCommandSnapshot | null): FeedVideoCommandSnapshot {
        if (!video) {
            throw new BadRequestException('동영상을 찾을 수 없습니다.');
        }

        return video;
    }

    ensureOwner(video: FeedVideoCommandSnapshot, userId: string): void {
        if (video.uploadedById !== userId) {
            throw new BadRequestException('권한이 없습니다.');
        }
    }

    ensurePending(video: FeedVideoCommandSnapshot): void {
        if (video.status !== VideoStatus.PENDING) {
            throw new BadRequestException('이미 처리 중이거나 완료된 동영상입니다.');
        }
    }

    getNextVisibility(video: FeedVideoCommandSnapshot): boolean {
        return !video.isPublic;
    }

    getRemovableFileKeys(video: FeedVideoCommandSnapshot): string[] {
        return [video.originalKey, video.thumbnailKey].filter((fileKey): fileKey is string => !!fileKey);
    }
}
