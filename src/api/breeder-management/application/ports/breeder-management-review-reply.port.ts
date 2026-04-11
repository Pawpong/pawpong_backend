export const BREEDER_MANAGEMENT_REVIEW_REPLY_PORT = Symbol('BREEDER_MANAGEMENT_REVIEW_REPLY_PORT');

export interface BreederManagementReviewReplyRecord {
    _id?: unknown;
    replyContent?: string | null;
    replyWrittenAt?: Date | null;
    replyUpdatedAt?: Date | null;
}

export interface BreederManagementReviewReplyPort {
    findReviewByIdAndBreeder(reviewId: string, breederId: string): Promise<BreederManagementReviewReplyRecord | null>;
    addReply(
        reviewId: string,
        payload: { replyContent: string; replyWrittenAt: Date },
    ): Promise<BreederManagementReviewReplyRecord | null>;
    updateReply(
        reviewId: string,
        payload: { replyContent: string; replyUpdatedAt: Date },
    ): Promise<BreederManagementReviewReplyRecord | null>;
    deleteReply(reviewId: string): Promise<BreederManagementReviewReplyRecord | null>;
}
