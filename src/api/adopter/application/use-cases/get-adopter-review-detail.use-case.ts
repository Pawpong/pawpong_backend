import { BadRequestException, Injectable } from '@nestjs/common';

import { AdopterReviewReaderPort } from '../ports/adopter-review-reader.port';
import { AdopterReviewDetailResponseFactoryService } from '../../domain/services/adopter-review-detail-response-factory.service';
import { MyReviewDetailDto } from '../../dto/response/my-review-detail.dto';

@Injectable()
export class GetAdopterReviewDetailUseCase {
    constructor(
        private readonly adopterReviewReaderPort: AdopterReviewReaderPort,
        private readonly adopterReviewDetailResponseFactoryService: AdopterReviewDetailResponseFactoryService,
    ) {}

    async execute(userId: string, reviewId: string): Promise<MyReviewDetailDto> {
        const review = await this.adopterReviewReaderPort.findDetailByAdopterId(userId, reviewId);
        if (!review) {
            throw new BadRequestException('후기를 찾을 수 없습니다.');
        }

        return this.adopterReviewDetailResponseFactoryService.create(review);
    }
}
