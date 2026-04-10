import { PriceDisplayType } from '../../../../common/enum/user.enum';
import type { PageResult } from '../../../../common/types/page-result.type';

export type BreederCardResult = {
    breederId: string;
    breederName: string;
    breederLevel: string;
    petType: string;
    location: string;
    mainBreed: string;
    isAdoptionAvailable: boolean;
    priceRange?: {
        min: number;
        max: number;
        display: PriceDisplayType;
    };
    favoriteCount: number;
    isFavorited: boolean;
    representativePhotos: string[];
    profileImage?: string;
    totalReviews: number;
    averageRating: number;
    createdAt: Date;
};

export type BreederSearchItemResult = {
    breederId: string;
    breederName: string;
    location: string;
    specialization: string | string[];
    averageRating: number;
    totalReviews: number;
    profileImage?: string;
    profilePhotos: string[];
    verificationStatus: string;
    availablePets: number;
};

export type BreederExplorePageResult = PageResult<BreederCardResult>;
export type BreederSearchPageResult = PageResult<BreederSearchItemResult>;

export type BreederProfileParentCardResult = {
    id: string;
    avatarUrl: string;
    name: string;
    sex: string;
    birth: string;
    breed: string;
    photos: string[];
};

export type BreederProfileAvailablePetResult = {
    petId: string;
    name: string;
    breed: string;
    gender: string;
    birthDate?: Date;
    price?: number;
    status?: string;
    description: string;
    photo: string;
    photos: string[];
    parents: BreederProfileParentCardResult[];
};

export type BreederProfileParentPetResult = {
    petId: string;
    name: string;
    breed: string;
    gender: string;
    birthDate?: Date;
    photo: string;
    photos: string[];
};

export type BreederProfileReviewPreviewResult = {
    reviewId?: string;
    writtenAt?: Date;
    type?: string;
    adopterName?: string;
    rating?: number;
    content?: string;
    photo?: string;
};

export type BreederProfileResult = {
    breederId: string;
    breederName: string;
    breederEmail: string;
    authProvider: string;
    breederLevel: string;
    petType: string;
    detailBreed?: string;
    breeds: string[];
    location: string;
    priceRange: {
        min: number;
        max: number;
        display: PriceDisplayType;
    };
    profileImage?: string;
    favoriteCount: number;
    isFavorited: boolean;
    description: string;
    representativePhotos: string[];
    availablePets: BreederProfileAvailablePetResult[];
    parentPets: BreederProfileParentPetResult[];
    reviews: BreederProfileReviewPreviewResult[];
    reviewStats: {
        totalReviews: number;
        averageRating: number;
    };
    createdAt?: Date;
};

export type BreederReviewItemResult = {
    reviewId: string;
    applicationId: string;
    adopterName: string;
    petName?: string;
    content: string;
    writtenAt: Date;
    type: string;
    replyContent: string | null;
    replyWrittenAt: Date | null;
    replyUpdatedAt: Date | null;
};

export type BreederReviewPageResult = PageResult<BreederReviewItemResult>;

export type BreederPetParentResult = {
    id: string;
    avatarUrl: string;
    name: string;
    sex: string;
    birth: string;
    breed: string;
    photos: string[];
};

export type BreederPetItemResult = {
    petId: string;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    ageInMonths: number;
    price: number;
    status: string;
    description: string;
    mainPhoto: string;
    photos: string[];
    photoCount: number;
    isVaccinated: boolean;
    hasMicrochip?: boolean;
    availableFrom?: Date;
    parents: BreederPetParentResult[];
};

export type BreederPetsPageResult = PageResult<BreederPetItemResult> & {
    availableCount: number;
    reservedCount: number;
    adoptedCount: number;
};
