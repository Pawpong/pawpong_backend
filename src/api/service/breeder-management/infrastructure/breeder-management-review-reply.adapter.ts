import { Injectable } from '@nestjs/common';
import type {
    BreederManagementReviewReplyPort,
    BreederManagementReviewReplyRecord,
} from '../application/ports/breeder-management-review-reply.port';
import { BreederManagementBreederReviewRepository } from '../repository/breeder-review.repository';

@Injectable()
export class BreederManagementReviewReplyAdapter implements BreederManagementReviewReplyPort {
    constructor(private readonly breederManagementBreederReviewRepository: BreederManagementBreederReviewRepository) {}

    async findReviewByIdAndBreeder(
        reviewId: string,
        breederId: string,
    ): Promise<BreederManagementReviewReplyRecord | null> {
        return this.breederManagementBreederReviewRepository.findByIdAndBreeder(reviewId, breederId);
    }

    async addReply(
        reviewId: string,
        payload: { replyContent: string; replyWrittenAt: Date },
    ): Promise<BreederManagementReviewReplyRecord | null> {
        return this.breederManagementBreederReviewRepository.addReply(reviewId, payload);
    }

    async updateReply(
        reviewId: string,
        payload: { replyContent: string; replyUpdatedAt: Date },
    ): Promise<BreederManagementReviewReplyRecord | null> {
        return this.breederManagementBreederReviewRepository.updateReply(reviewId, payload);
    }

    async deleteReply(reviewId: string): Promise<BreederManagementReviewReplyRecord | null> {
        return this.breederManagementBreederReviewRepository.deleteReply(reviewId);
    }
}
