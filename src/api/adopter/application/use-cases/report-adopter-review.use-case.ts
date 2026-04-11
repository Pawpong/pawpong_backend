import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import { ADOPTER_REVIEW_COMMAND_PORT, type AdopterReviewCommandPort } from '../ports/adopter-review-command.port';
import type { AdopterReviewReportCommand } from '../types/adopter-review-command.type';
import type { AdopterReviewReportResult } from '../types/adopter-result.type';
import { ADOPTER_RESPONSE_PAYLOAD_MESSAGES } from '../../constants/adopter-response-messages';

@Injectable()
export class ReportAdopterReviewUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        @Inject(ADOPTER_REVIEW_COMMAND_PORT)
        private readonly adopterReviewCommandPort: AdopterReviewCommandPort,
    ) {}

    async execute(userId: string, dto: AdopterReviewReportCommand): Promise<AdopterReviewReportResult> {
        const adopter = await this.adopterProfilePort.findById(userId);
        const breeder = await this.adopterBreederReaderPort.findById(userId);

        if (!adopter && !breeder) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        const review = await this.adopterReviewCommandPort.findReviewById(dto.reviewId);
        if (!review) {
            throw new BadRequestException('신고할 후기를 찾을 수 없습니다.');
        }

        await this.adopterReviewCommandPort.markAsReported(
            dto.reviewId,
            userId,
            dto.reason,
            dto.description || '',
            new Date(),
        );

        return {
            message: ADOPTER_RESPONSE_PAYLOAD_MESSAGES.reviewReported,
        };
    }
}
