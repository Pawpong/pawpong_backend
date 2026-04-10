import { PriceDisplayType } from '../../../../common/enum/user.enum';
import type { PageResult } from '../../../../common/types/page-result.type';

export type AdopterProfileFavoriteResult = {
    breederId: string;
    breederName: string;
    addedAt: Date;
    breederProfileImageUrl?: string;
    breederLocation?: string;
};

export type AdopterProfileApplicationResult = {
    applicationId: string;
    breederId: string;
    petId: string;
    applicationStatus: string;
    appliedAt: Date;
};

export type AdopterProfileWrittenReviewResult = {
    reviewId: string;
    breederId: string;
    rating: number;
    content: string;
    createdAt: Date;
};

export type AdopterProfileResult = {
    adopterId: string;
    emailAddress: string;
    nickname: string;
    phoneNumber: string;
    profileImageFileName?: string;
    accountStatus: string;
    authProvider: string;
    marketingAgreed: boolean;
    favoriteBreederList: AdopterProfileFavoriteResult[];
    adoptionApplicationList: AdopterProfileApplicationResult[];
    writtenReviewList: AdopterProfileWrittenReviewResult[];
    createdAt: Date;
    updatedAt: Date;
};

export type AdopterApplicationCustomResponseResult = {
    questionId: string;
    questionLabel: string;
    questionType: string;
    answer: unknown;
};

export type AdopterApplicationListItemResult = {
    applicationId: string;
    breederId: string;
    adopterId: string | null;
    breederName: string;
    petId?: string;
    petName?: string;
    status: string;
    appliedAt: string;
    processedAt?: string;
    breederLevel: 'elite' | 'new';
    profileImage?: string | null;
    animalType: 'cat' | 'dog';
    applicationDate: string;
    customResponses?: AdopterApplicationCustomResponseResult[];
};

export type AdopterApplicationPageResult = PageResult<AdopterApplicationListItemResult>;

export type AdopterApplicationDetailResult = {
    applicationId: string;
    breederId: string;
    breederName: string;
    petId?: string;
    petName?: string;
    status: string;
    standardResponses?: Record<string, unknown>;
    customResponses: AdopterApplicationCustomResponseResult[];
    appliedAt: string;
    processedAt?: string;
    breederNotes?: string;
};

export type AdopterApplicationCreateResult = {
    applicationId: string;
    breederId: string;
    breederName: string;
    petId?: string;
    petName?: string;
    status: string;
    appliedAt: string;
    message: string;
};

export type AdopterFavoriteBreederResult = {
    breederId: string;
    breederName: string;
    profileImage?: string;
    representativePhotos?: string[];
    breederLevel?: string;
    petType?: string;
    location: string;
    specialization?: string | string[];
    averageRating: number;
    totalReviews: number;
    priceRange?: {
        min: number;
        max: number;
        display: PriceDisplayType;
    };
    availablePets: number;
    addedAt: Date;
    isActive: boolean;
};

export type AdopterFavoritePageResult = PageResult<AdopterFavoriteBreederResult>;

export type AdopterReviewItemResult = {
    reviewId: string;
    applicationId: string | null;
    breederId: string | null;
    breederNickname: string;
    breederProfileImage: string | null;
    breederLevel: string;
    breedingPetType: string;
    content: string;
    reviewType: string;
    writtenAt: Date;
};

export type AdopterReviewPageResult = PageResult<AdopterReviewItemResult>;

export type AdopterReviewDetailResult = {
    reviewId: string;
    breederNickname: string;
    breederProfileImage: string | null;
    breederLevel: string;
    breedingPetType: string;
    content: string;
    reviewType: string;
    writtenAt: Date;
    isVisible: boolean;
};

export type AdopterReviewCreateResult = {
    reviewId: string;
    applicationId: string;
    breederId: string;
    reviewType: string;
    writtenAt: string;
};

export type AdopterReviewReportResult = {
    message: string;
};

export type AdopterAccountDeleteResult = {
    adopterId: string;
    deletedAt: string;
    message: string;
};

export type AdopterReportCreateResult = {
    reportId: string;
    message: string;
};
