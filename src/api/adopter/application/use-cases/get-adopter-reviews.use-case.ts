import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { AdopterReviewReaderPort } from '../ports/adopter-review-reader.port';
import { AdopterReviewPageAssemblerService } from '../../domain/services/adopter-review-page-assembler.service';
import type { AdopterReviewPageResult } from '../types/adopter-result.type';

@Injectable()
export class GetAdopterReviewsUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        private readonly adopterReviewReaderPort: AdopterReviewReaderPort,
        private readonly adopterReviewPageAssemblerService: AdopterReviewPageAssemblerService,
    ) {}

    async execute(userId: string, page: number = 1, limit: number = 10): Promise<AdopterReviewPageResult> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const total = await this.adopterReviewReaderPort.countByAdopterId(userId);
        const reviews = await this.adopterReviewReaderPort.findPagedByAdopterId(userId, page, limit);

        return this.adopterReviewPageAssemblerService.build(reviews, page, limit, total);
    }
}
