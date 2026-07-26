export type AdopterReviewApplicationRecord = {
    _id: { toString(): string };
    adopterId: { toString(): string };
    breederId: { toString(): string };
    status: string;
};

export type AdopterReviewCreateCommand = {
    applicationId: string;
    breederId: string;
    adopterId: string;
    type: string;
    content: string;
    writtenAt: Date;
    isVisible: boolean;
};

export type AdopterReviewCreatedRecord = {
    _id: { toString(): string };
    applicationId: { toString(): string };
    breederId: { toString(): string };
    type: string;
    writtenAt: Date;
};

export type AdopterReviewRecord = {
    _id: { toString(): string };
};

export const ADOPTER_REVIEW_COMMAND_PORT = Symbol('ADOPTER_REVIEW_COMMAND_PORT');

export interface AdopterReviewCommandPort {
    findApplicationById(applicationId: string): Promise<AdopterReviewApplicationRecord | null>;
    create(command: AdopterReviewCreateCommand): Promise<AdopterReviewCreatedRecord>;
    incrementBreederReviewCount(breederId: string): Promise<void>;
    findReviewById(reviewId: string): Promise<AdopterReviewRecord | null>;
    markAsReported(
        reviewId: string,
        reporterId: string,
        reason: string,
        description: string,
        reportedAt: Date,
    ): Promise<void>;
}
