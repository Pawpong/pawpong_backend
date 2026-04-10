import { Injectable } from '@nestjs/common';

import type { AdopterReviewDetailRecord } from '../../application/ports/adopter-review-reader.port';
import type { AdopterReviewDetailResult } from '../../application/types/adopter-result.type';

@Injectable()
export class AdopterReviewDetailResponseFactoryService {
    create(review: AdopterReviewDetailRecord): AdopterReviewDetailResult {
        return {
            reviewId: review.reviewId,
            breederNickname: review.breederNickname || '알 수 없음',
            breederProfileImage: review.breederProfileImageFileName,
            breederLevel: review.breederLevel || 'new',
            breedingPetType: review.breedingPetType || 'unknown',
            content: review.content,
            reviewType: review.reviewType,
            writtenAt: review.writtenAt,
            isVisible: review.isVisible,
        };
    }
}
