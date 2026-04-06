import { BadRequestException, Injectable } from '@nestjs/common';

import { FeedLikeVideoCounterSnapshot } from '../../application/ports/feed-like-manager.port';

@Injectable()
export class FeedLikePolicyService {
    requireVideo(video: FeedLikeVideoCounterSnapshot | null): FeedLikeVideoCounterSnapshot {
        if (!video) {
            throw new BadRequestException('동영상을 찾을 수 없습니다.');
        }

        return video;
    }
}
