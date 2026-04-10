import { Injectable } from '@nestjs/common';

import type { FeedVideoSegmentPrefetchResult } from '../application/types/feed-video-result.type';

@Injectable()
export class FeedVideoPrefetchPresentationService {
    buildResponse(requestedCount: number): FeedVideoSegmentPrefetchResult {
        return {
            success: true,
            message: `${requestedCount}개 세그먼트 프리페치 완료`,
        };
    }
}
