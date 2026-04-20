import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';
import { FeedLikeVideoCounterSnapshot } from '../../application/ports/feed-like-manager.port';

@Injectable()
export class FeedLikePolicyService {
    requireVideo(video: FeedLikeVideoCounterSnapshot | null): FeedLikeVideoCounterSnapshot {
        if (!video) {
            throw new DomainValidationError('동영상을 찾을 수 없습니다.');
        }

        return video;
    }
}
