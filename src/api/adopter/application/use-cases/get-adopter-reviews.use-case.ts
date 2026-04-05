import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { AdopterReviewReaderPort } from '../ports/adopter-review-reader.port';
import { AdopterReviewListResponseFactoryService } from '../../domain/services/adopter-review-list-response-factory.service';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { MyReviewItemDto } from '../../dto/response/my-review-item.dto';

@Injectable()
export class GetAdopterReviewsUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        private readonly adopterReviewReaderPort: AdopterReviewReaderPort,
        private readonly adopterReviewListResponseFactoryService: AdopterReviewListResponseFactoryService,
    ) {}

    async execute(userId: string, page: number = 1, limit: number = 10): Promise<PaginationResponseDto<MyReviewItemDto>> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const total = await this.adopterReviewReaderPort.countByAdopterId(userId);
        const reviews = await this.adopterReviewReaderPort.findPagedByAdopterId(userId, page, limit);

        return this.adopterReviewListResponseFactoryService.create(reviews, page, limit, total);
    }
}
