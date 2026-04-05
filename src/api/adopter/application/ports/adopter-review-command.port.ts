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

export abstract class AdopterReviewCommandPort {
    abstract findApplicationById(applicationId: string): Promise<AdopterReviewApplicationRecord | null>;
    abstract create(command: AdopterReviewCreateCommand): Promise<AdopterReviewCreatedRecord>;
    abstract incrementBreederReviewCount(breederId: string): Promise<void>;
    abstract findReviewById(reviewId: string): Promise<AdopterReviewRecord | null>;
    abstract markAsReported(
        reviewId: string,
        reporterId: string,
        reason: string,
        description: string,
        reportedAt: Date,
    ): Promise<void>;
}
