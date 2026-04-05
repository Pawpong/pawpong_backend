export type AdopterReviewListRecord = {
    reviewId: string;
    applicationId: string | null;
    breederId: string | null;
    breederNickname: string | null;
    breederProfileImageFileName: string | null;
    breederLevel: string | null;
    breedingPetType: string | null;
    content: string;
    reviewType: string;
    writtenAt: Date;
};

export type AdopterReviewDetailRecord = {
    reviewId: string;
    breederNickname: string | null;
    breederProfileImageFileName: string | null;
    breederLevel: string | null;
    breedingPetType: string | null;
    content: string;
    reviewType: string;
    writtenAt: Date;
    isVisible: boolean;
};

export abstract class AdopterReviewReaderPort {
    abstract countByAdopterId(adopterId: string): Promise<number>;
    abstract findPagedByAdopterId(adopterId: string, page: number, limit: number): Promise<AdopterReviewListRecord[]>;
    abstract findDetailByAdopterId(adopterId: string, reviewId: string): Promise<AdopterReviewDetailRecord | null>;
}
