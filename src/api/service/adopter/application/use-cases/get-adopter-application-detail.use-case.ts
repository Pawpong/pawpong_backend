import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { ADOPTER_APPLICATION_READER_PORT } from '../ports/adopter-application-reader.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_REVIEW_READER_PORT } from '../ports/adopter-review-reader.port';
import type { AdopterApplicationReaderPort } from '../ports/adopter-application-reader.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterReviewReaderPort } from '../ports/adopter-review-reader.port';
import { AdopterApplicationDetailAssemblerService } from '../../domain/services/adopter-application-detail-assembler.service';
import type { AdopterApplicationDetailResult } from '../types/adopter-result.type';

@Injectable()
export class GetAdopterApplicationDetailUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_APPLICATION_READER_PORT)
        private readonly adopterApplicationReaderPort: AdopterApplicationReaderPort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_REVIEW_READER_PORT)
        private readonly adopterReviewReaderPort: AdopterReviewReaderPort,
        private readonly adopterApplicationDetailAssemblerService: AdopterApplicationDetailAssemblerService,
    ) {}

    async execute(userId: string, applicationId: string, userRole?: string): Promise<AdopterApplicationDetailResult> {
        // 브리더 계정도 신청을 보낼 수 있어, role을 넘겨야 브리더 컬렉션에서도 조회한다.
        const applicant = userRole
            ? await this.adopterProfilePort.findById(userId, userRole)
            : await this.adopterProfilePort.findById(userId);
        if (!applicant) {
            throw new DomainNotFoundError('회원 정보를 찾을 수 없습니다.');
        }

        const application = await this.adopterApplicationReaderPort.findByIdForAdopter(userId, applicationId);
        if (!application) {
            throw new DomainNotFoundError('해당 입양 신청을 찾을 수 없거나 조회 권한이 없습니다.');
        }

        const breeder = await this.adopterBreederReaderPort.findById(application.breederId.toString());
        const reviewId = await this.adopterReviewReaderPort.findIdByApplicationId(applicationId);
        return this.adopterApplicationDetailAssemblerService.toResponse(application, breeder, reviewId);
    }
}
