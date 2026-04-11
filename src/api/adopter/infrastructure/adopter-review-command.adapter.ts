import { Injectable } from '@nestjs/common';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import type {
    AdopterReviewApplicationRecord,
    AdopterReviewCreateCommand,
    AdopterReviewCreatedRecord,
    AdopterReviewRecord,
} from '../application/ports/adopter-review-command.port';
import type { AdopterReviewCommandPort } from '../application/ports/adopter-review-command.port';
import { AdopterReviewRepository } from '../repository/adopter-review.repository';

@Injectable()
export class AdopterReviewCommandAdapter implements AdopterReviewCommandPort {
    constructor(
        private readonly adopterReviewRepository: AdopterReviewRepository,
        private readonly breederRepository: BreederRepository,
    ) {}

    async findApplicationById(applicationId: string): Promise<AdopterReviewApplicationRecord | null> {
        return (await this.adopterReviewRepository.findApplicationById(
            applicationId,
        )) as AdopterReviewApplicationRecord | null;
    }

    async create(command: AdopterReviewCreateCommand): Promise<AdopterReviewCreatedRecord> {
        return (await this.adopterReviewRepository.create(command)) as AdopterReviewCreatedRecord;
    }

    incrementBreederReviewCount(breederId: string): Promise<void> {
        return this.breederRepository.incrementReviewCount(breederId);
    }

    async findReviewById(reviewId: string): Promise<AdopterReviewRecord | null> {
        return (await this.adopterReviewRepository.findReviewById(reviewId)) as AdopterReviewRecord | null;
    }

    async markAsReported(
        reviewId: string,
        reporterId: string,
        reason: string,
        description: string,
        reportedAt: Date,
    ): Promise<void> {
        await this.adopterReviewRepository.markAsReported(reviewId, reporterId, reason, description, reportedAt);
    }
}
