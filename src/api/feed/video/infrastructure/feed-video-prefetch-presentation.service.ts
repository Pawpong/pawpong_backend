import { Injectable } from '@nestjs/common';

import { SegmentPrefetchResponseDto } from '../dto/response/video-response.dto';

@Injectable()
export class FeedVideoPrefetchPresentationService {
    buildResponse(requestedCount: number): SegmentPrefetchResponseDto {
        return {
            success: true,
            message: `${requestedCount}개 세그먼트 프리페치 완료`,
        };
    }
}
