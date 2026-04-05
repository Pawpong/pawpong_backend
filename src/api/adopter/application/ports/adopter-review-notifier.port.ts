export abstract class AdopterReviewNotifierPort {
    abstract notifyBreederOfNewReview(breederId: string): Promise<void>;
}
