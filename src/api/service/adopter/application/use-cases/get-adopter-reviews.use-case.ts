import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { ADOPTER_REVIEW_READER_PORT, type AdopterReviewReaderPort } from '../ports/adopter-review-reader.port';
import { AdopterReviewPageAssemblerService } from '../../domain/services/adopter-review-page-assembler.service';
import type { AdopterReviewPageResult } from '../types/adopter-result.type';

@Injectable()
export class GetAdopterReviewsUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_REVIEW_READER_PORT)
        private readonly adopterReviewReaderPort: AdopterReviewReaderPort,
        private readonly adopterReviewPageAssemblerService: AdopterReviewPageAssemblerService,
    ) {}

    async execute(
        userId: string,
        page: number = 1,
        limit: number = 10,
        userRole?: string,
    ): Promise<AdopterReviewPageResult> {
        // 브리더 계정도 후기를 쓸 수 있어, role을 넘겨야 브리더 컬렉션에서도 조회한다.
        const applicant = userRole
            ? await this.adopterProfilePort.findById(userId, userRole)
            : await this.adopterProfilePort.findById(userId);
        if (!applicant) {
            throw new DomainNotFoundError('회원 정보를 찾을 수 없습니다.');
        }

        const total = await this.adopterReviewReaderPort.countByAdopterId(userId);
        const reviews = await this.adopterReviewReaderPort.findPagedByAdopterId(userId, page, limit);

        return this.adopterReviewPageAssemblerService.build(reviews, page, limit, total);
    }
}
