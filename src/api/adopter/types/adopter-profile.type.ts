import type { AdopterApplicationEmbeddedRecord } from './adopter-application.type';

export type AdopterFavoriteRecord = {
    favoriteBreederId: string;
    breederName: string;
    breederProfileImageUrl?: string;
    breederLocation?: string;
    addedAt: Date;
};

export type AdopterWrittenReviewEmbeddedRecord = {
    reviewId: string;
    targetBreederId: string;
    overallRating: number;
    reviewContent: string;
    createdAt: Date;
};

export type AdopterProfileUpdateRecord = {
    fullName?: string;
    phoneNumber?: string;
    profileImageFileName?: string;
    marketingConsent?: boolean;
    accountStatus?: string;
    deletedAt?: Date;
    deleteReason?: string;
    deleteReasonDetail?: string | null;
    updatedAt?: Date;
};

export type AdopterProfileApplicationRecord = AdopterApplicationEmbeddedRecord;
