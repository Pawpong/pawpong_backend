import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BreederReview, BreederReviewDocument } from '../../../schema/breeder-review.schema';
import type {
    BreederManagementReviewReplyPort,
    BreederManagementReviewReplyRecord,
} from '../application/ports/breeder-management-review-reply.port';

@Injectable()
export class BreederManagementReviewReplyAdapter implements BreederManagementReviewReplyPort {
    constructor(
        @InjectModel(BreederReview.name)
        private readonly breederReviewModel: Model<BreederReviewDocument>,
    ) {}

    async findReviewByIdAndBreeder(
        reviewId: string,
        breederId: string,
    ): Promise<BreederManagementReviewReplyRecord | null> {
        return this.breederReviewModel.findOne({
            _id: new Types.ObjectId(reviewId),
            breederId: new Types.ObjectId(breederId),
        });
    }

    async addReply(
        reviewId: string,
        payload: { replyContent: string; replyWrittenAt: Date },
    ): Promise<BreederManagementReviewReplyRecord | null> {
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

    async updateReply(
        reviewId: string,
        payload: { replyContent: string; replyUpdatedAt: Date },
    ): Promise<BreederManagementReviewReplyRecord | null> {
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

    async deleteReply(reviewId: string): Promise<BreederManagementReviewReplyRecord | null> {
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
