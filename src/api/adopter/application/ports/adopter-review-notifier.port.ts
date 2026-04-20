export const ADOPTER_REVIEW_NOTIFIER_PORT = Symbol('ADOPTER_REVIEW_NOTIFIER_PORT');

export interface AdopterReviewNotifierPort {
    notifyBreederOfNewReview(breederId: string): Promise<void>;
}
