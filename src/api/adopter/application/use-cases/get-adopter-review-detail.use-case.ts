import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ADOPTER_REVIEW_READER_PORT, type AdopterReviewReaderPort } from '../ports/adopter-review-reader.port';
import { AdopterReviewDetailMapperService } from '../../domain/services/adopter-review-detail-mapper.service';
import type { AdopterReviewDetailResult } from '../types/adopter-result.type';

@Injectable()
export class GetAdopterReviewDetailUseCase {
    constructor(
        @Inject(ADOPTER_REVIEW_READER_PORT)
        private readonly adopterReviewReaderPort: AdopterReviewReaderPort,
        private readonly adopterReviewDetailMapperService: AdopterReviewDetailMapperService,
    ) {}

    async execute(userId: string, reviewId: string): Promise<AdopterReviewDetailResult> {
        const review = await this.adopterReviewReaderPort.findDetailByAdopterId(userId, reviewId);
        if (!review) {
            throw new BadRequestException('후기를 찾을 수 없습니다.');
        }

        return this.adopterReviewDetailMapperService.toResult(review);
    }
}
