import { Injectable } from '@nestjs/common';

import type { AdopterReviewListRecord } from '../../application/ports/adopter-review-reader.port';
import type { AdopterReviewItemResult, AdopterReviewPageResult } from '../../application/types/adopter-result.type';
import { AdopterPaginationAssemblerService } from './adopter-pagination-assembler.service';

@Injectable()
export class AdopterReviewPageAssemblerService {
    constructor(private readonly adopterPaginationAssemblerService: AdopterPaginationAssemblerService) {}

    build(reviews: AdopterReviewListRecord[], page: number, limit: number, total: number): AdopterReviewPageResult {
        const items = reviews.map((review) => this.toItem(review));

        return this.adopterPaginationAssemblerService.build(items, page, limit, total);
    }

    private toItem(review: AdopterReviewListRecord): AdopterReviewItemResult {
        return {
            reviewId: review.reviewId,
            applicationId: review.applicationId,
            breederId: review.breederId,
            breederNickname: review.breederNickname || '알 수 없음',
            breederProfileImage: review.breederProfileImageFileName,
            breederLevel: review.breederLevel || 'new',
            breedingPetType: review.breedingPetType || 'unknown',
            content: review.content,
            reviewType: review.reviewType,
            writtenAt: review.writtenAt,
        };
    }
}
