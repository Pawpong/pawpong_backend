import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BreederReview, BreederReviewDocument } from '../../../schema/breeder-review.schema';

@Injectable()
export class BreederManagementBreederReviewRepository {
    constructor(
        @InjectModel(BreederReview.name)
        private readonly breederReviewModel: Model<BreederReviewDocument>,
    ) {}

    countByBreederId(breederId: string): Promise<number> {
        return this.breederReviewModel.countDocuments({ breederId: new Types.ObjectId(breederId) }).exec();
    }

    countByBreederIdAndVisibility(breederId: string, isVisible: boolean): Promise<number> {
        return this.breederReviewModel
            .countDocuments({
                breederId: new Types.ObjectId(breederId),
                isVisible,
            })
            .exec();
    }

    findByBreederIdAndVisibility(
        breederId: string,
        visibility: string,
        skip: number,
        limit: number,
    ) {
        const filter: Record<string, unknown> = {
            breederId: new Types.ObjectId(breederId),
        };

        if (visibility === 'visible') {
            filter.isVisible = true;
        } else if (visibility === 'hidden') {
            filter.isVisible = false;
        }

        return this.breederReviewModel
            .find(filter)
            .sort({ writtenAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('adopterId', 'name nickname')
            .lean()
            .exec();
    }

    findByIdAndBreeder(reviewId: string, breederId: string) {
        return this.breederReviewModel.findOne({
            _id: new Types.ObjectId(reviewId),
            breederId: new Types.ObjectId(breederId),
        });
    }

    addReply(reviewId: string, payload: { replyContent: string; replyWrittenAt: Date }) {
        return this.breederReviewModel.findByIdAndUpdate(
            reviewId,
            {
                $set: {
                    replyContent: payload.replyContent,
                    replyWrittenAt: payload.replyWrittenAt,
                },
            },
            { new: true },
        );
    }

    updateReply(reviewId: string, payload: { replyContent: string; replyUpdatedAt: Date }) {
        return this.breederReviewModel.findByIdAndUpdate(
            reviewId,
            {
                $set: {
                    replyContent: payload.replyContent,
                    replyUpdatedAt: payload.replyUpdatedAt,
                },
            },
            { new: true },
        );
    }

    deleteReply(reviewId: string) {
        return this.breederReviewModel.findByIdAndUpdate(
            reviewId,
            {
                $unset: {
                    replyContent: '',
                    replyWrittenAt: '',
                    replyUpdatedAt: '',
                },
            },
            { new: true },
        );
    }
}
