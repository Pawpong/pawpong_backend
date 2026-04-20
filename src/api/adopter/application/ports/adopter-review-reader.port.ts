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

export const ADOPTER_REVIEW_READER_PORT = Symbol('ADOPTER_REVIEW_READER_PORT');

export interface AdopterReviewReaderPort {
    countByAdopterId(adopterId: string): Promise<number>;
    findPagedByAdopterId(adopterId: string, page: number, limit: number): Promise<AdopterReviewListRecord[]>;
    findDetailByAdopterId(adopterId: string, reviewId: string): Promise<AdopterReviewDetailRecord | null>;
}
