import { Injectable } from '@nestjs/common';

import type { AdopterReviewCreateResult } from '../../application/types/adopter-result.type';
import type { AdopterReviewCreatedRecord } from '../../application/ports/adopter-review-command.port';

@Injectable()
export class AdopterReviewCreateResponseFactoryService {
    create(review: AdopterReviewCreatedRecord): AdopterReviewCreateResult {
        return {
            reviewId: review._id.toString(),
            applicationId: review.applicationId.toString(),
            breederId: review.breederId.toString(),
            reviewType: review.type,
            writtenAt: review.writtenAt.toISOString(),
        };
    }
}
