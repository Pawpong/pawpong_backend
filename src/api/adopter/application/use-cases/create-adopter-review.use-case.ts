import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError, DomainValidationError } from '../../../../common/error/domain.error';
import { ApplicationStatus } from '../../../../common/enum/user.enum';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_REVIEW_COMMAND_PORT, type AdopterReviewCommandPort } from '../ports/adopter-review-command.port';
import {
    ADOPTER_REVIEW_NOTIFIER_PORT,
    type AdopterReviewNotifierPort,
} from '../ports/adopter-review-notifier.port';
import type { AdopterReviewCreateCommand } from '../types/adopter-review-command.type';
import type { AdopterReviewCreateResult } from '../types/adopter-result.type';

@Injectable()
export class CreateAdopterReviewUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_REVIEW_COMMAND_PORT)
        private readonly adopterReviewCommandPort: AdopterReviewCommandPort,
        @Inject(ADOPTER_REVIEW_NOTIFIER_PORT)
        private readonly adopterReviewNotifierPort: AdopterReviewNotifierPort,
    ) {}

    async execute(userId: string, dto: AdopterReviewCreateCommand): Promise<AdopterReviewCreateResult> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }

        const application = await this.adopterReviewCommandPort.findApplicationById(dto.applicationId);
        if (!application) {
            throw new DomainNotFoundError('해당 입양 신청을 찾을 수 없습니다.');
        }

        if (application.adopterId.toString() !== userId) {
            throw new DomainValidationError('본인의 입양 신청에 대해서만 후기를 작성할 수 있습니다.');
        }

        if (application.status !== ApplicationStatus.CONSULTATION_COMPLETED) {
            throw new DomainValidationError(
                '상담이 완료된 신청에 대해서만 후기를 작성할 수 있습니다. 현재 상태: ' + application.status,
            );
        }

        const breeder = await this.adopterBreederReaderPort.findById(application.breederId.toString());
        if (!breeder) {
            throw new DomainNotFoundError('해당 브리더를 찾을 수 없습니다.');
        }

        const savedReview = await this.adopterReviewCommandPort.create({
            applicationId: dto.applicationId,
            breederId: application.breederId.toString(),
            adopterId: userId,
            type: dto.reviewType,
            content: dto.content,
            writtenAt: new Date(),
            isVisible: true,
        });

        await this.adopterReviewCommandPort.incrementBreederReviewCount(application.breederId.toString());
        await this.adopterReviewNotifierPort.notifyBreederOfNewReview(application.breederId.toString());

        return {
            reviewId: savedReview._id.toString(),
            applicationId: savedReview.applicationId.toString(),
            breederId: savedReview.breederId.toString(),
            reviewType: savedReview.type,
            writtenAt: savedReview.writtenAt.toISOString(),
        };
    }
}
