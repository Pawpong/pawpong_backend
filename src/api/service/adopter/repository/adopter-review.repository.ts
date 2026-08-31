import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import { BreederReview, BreederReviewDocument } from '../../../../schema/breeder-review.schema';
import type { AdopterReviewCreateCommand } from '../application/ports/adopter-review-command.port';

@Injectable()
export class AdopterReviewRepository {
    constructor(
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
        @InjectModel(BreederReview.name)
        private readonly breederReviewModel: Model<BreederReviewDocument>,
    ) {}

    findApplicationById(applicationId: string) {
        if (!Types.ObjectId.isValid(applicationId)) {
            return Promise.resolve(null);
        }
        return this.adoptionApplicationModel.findById(applicationId).exec();
    }

    async create(command: AdopterReviewCreateCommand) {
        const review = new this.breederReviewModel(command);
        return review.save();
    }

    findReviewById(reviewId: string) {
        if (!Types.ObjectId.isValid(reviewId)) {
            return Promise.resolve(null);
        }
        return this.breederReviewModel.findById(reviewId).exec();
    }

    findReviewByApplicationId(applicationId: string) {
        if (!Types.ObjectId.isValid(applicationId)) {
            return Promise.resolve(null);
        }
        return this.breederReviewModel.findOne({ applicationId }).select('_id').lean().exec();
    }

    findReviewsByApplicationIds(applicationIds: string[]) {
        const validIds = applicationIds.filter((applicationId) => Types.ObjectId.isValid(applicationId));
        if (validIds.length === 0) {
            return Promise.resolve([]);
        }

        // 과거 중복 데이터가 있더라도 최초 작성 후기 하나로 일관되게 연결한다.
        return this.breederReviewModel
            .find({ applicationId: { $in: validIds } })
            .select('_id applicationId writtenAt')
            .sort({ writtenAt: 1, _id: 1 })
            .lean()
            .exec();
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

    countByAdopterId(adopterId: string): Promise<number> {
        return this.breederReviewModel.countDocuments({ adopterId }).exec();
    }

    findPagedByAdopterId(adopterId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        return this.breederReviewModel
            .find({ adopterId })
            .sort({ writtenAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('breederId', 'nickname profileImageFileName verification.level petType')
            .lean()
            .exec();
    }

    findDetailByAdopterId(adopterId: string, reviewId: string) {
        if (!Types.ObjectId.isValid(reviewId)) {
            return Promise.resolve(null);
        }
        return this.breederReviewModel
            .findOne({ _id: reviewId, adopterId })
            .populate('breederId', 'nickname profileImageFileName verification.level petType')
            .lean()
            .exec();
    }
}
