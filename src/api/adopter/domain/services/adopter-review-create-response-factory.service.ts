import { Injectable } from '@nestjs/common';

import { ReviewCreateResponseDto } from '../../dto/response/review-create-response.dto';
import type { AdopterReviewCreatedRecord } from '../../application/ports/adopter-review-command.port';

@Injectable()
export class AdopterReviewCreateResponseFactoryService {
    create(review: AdopterReviewCreatedRecord): ReviewCreateResponseDto {
        return {
            reviewId: review._id.toString(),
            applicationId: review.applicationId.toString(),
            breederId: review.breederId.toString(),
            reviewType: review.type,
            writtenAt: review.writtenAt.toISOString(),
        };
    }
}
