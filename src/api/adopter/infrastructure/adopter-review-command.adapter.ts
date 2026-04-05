import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AdoptionApplication, AdoptionApplicationDocument } from '../../../schema/adoption-application.schema';
import { BreederReview, BreederReviewDocument } from '../../../schema/breeder-review.schema';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import type {
    AdopterReviewApplicationRecord,
    AdopterReviewCreateCommand,
    AdopterReviewCreatedRecord,
    AdopterReviewRecord,
} from '../application/ports/adopter-review-command.port';
import { AdopterReviewCommandPort } from '../application/ports/adopter-review-command.port';

@Injectable()
export class AdopterReviewCommandAdapter extends AdopterReviewCommandPort {
    constructor(
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
        @InjectModel(BreederReview.name)
        private readonly breederReviewModel: Model<BreederReviewDocument>,
        private readonly breederRepository: BreederRepository,
    ) {
        super();
    }

    async findApplicationById(applicationId: string): Promise<AdopterReviewApplicationRecord | null> {
        return (await this.adoptionApplicationModel.findById(applicationId).exec()) as AdopterReviewApplicationRecord | null;
    }

    async create(command: AdopterReviewCreateCommand): Promise<AdopterReviewCreatedRecord> {
        const review = new this.breederReviewModel(command);
        return (await review.save()) as AdopterReviewCreatedRecord;
    }

    incrementBreederReviewCount(breederId: string): Promise<void> {
        return this.breederRepository.incrementReviewCount(breederId);
    }

    async findReviewById(reviewId: string): Promise<AdopterReviewRecord | null> {
        return (await this.breederReviewModel.findById(reviewId).exec()) as AdopterReviewRecord | null;
    }

    async markAsReported(
        reviewId: string,
        reporterId: string,
        reason: string,
        description: string,
        reportedAt: Date,
    ): Promise<void> {
        await this.breederReviewModel
            .findByIdAndUpdate(reviewId, {
                $set: {
                    isReported: true,
                    reportedBy: reporterId,
                    reportReason: reason,
                    reportDescription: description,
                    reportedAt,
                },
            })
            .exec();
    }
}
