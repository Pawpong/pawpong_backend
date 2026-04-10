import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ReviewReportResponseDto } from '../../dto/response/review-report-response.dto';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import { AdopterReviewCommandPort } from '../ports/adopter-review-command.port';
import { AdopterReviewReportResponseFactoryService } from '../../domain/services/adopter-review-report-response-factory.service';
import type { AdopterReviewReportCommand } from '../types/adopter-review-command.type';

@Injectable()
export class ReportAdopterReviewUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        private readonly adopterReviewCommandPort: AdopterReviewCommandPort,
        private readonly adopterReviewReportResponseFactoryService: AdopterReviewReportResponseFactoryService,
    ) {}

    async execute(userId: string, dto: AdopterReviewReportCommand): Promise<ReviewReportResponseDto> {
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

        return this.adopterReviewReportResponseFactoryService.create();
    }
}
