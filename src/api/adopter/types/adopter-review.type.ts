import type { AdopterObjectIdLike } from './adopter-application.type';

export type AdopterReviewSourceApplicationRecord = {
    applicationId: string;
    targetBreederId: string;
    targetBreederName: string;
};

export type AdopterReviewWriteRecord = {
    reviewId: string;
    targetBreederId: string;
    targetBreederName: string;
    relatedApplicationId: string;
    reviewType: string;
    overallRating: number;
    petHealthRating: number;
    communicationRating: number;
    reviewContent: string;
    reviewPhotoUrls: string[];
    createdAt: Date;
    isVisible: boolean;
};

export type AdopterBreederReviewWriteRecord = {
    reviewId: string;
    adopterId: string;
    adopterName: string;
    applicationId: string;
    type: string;
    rating: number;
    content: string;
    photos: string[];
    writtenAt: Date;
    isVisible: boolean;
};

export type AdopterReviewRepositoryBreederRecord = {
    _id?: AdopterObjectIdLike;
    nickname?: string | null;
    profileImageFileName?: string | null;
    verification?: {
        level?: string | null;
    };
    petType?: string | null;
};

export type AdopterReviewRepositoryRecord = {
    _id: AdopterObjectIdLike;
    applicationId?: AdopterObjectIdLike;
    breederId?: AdopterReviewRepositoryBreederRecord | null;
    content: string;
    type: string;
    writtenAt: Date;
    isVisible: boolean;
};
