export type AdopterReviewCreateCommand = {
    applicationId: string;
    reviewType: string;
    content: string;
};

export type AdopterReviewReportCommand = {
    reviewId: string;
    reason: string;
    description?: string;
};
