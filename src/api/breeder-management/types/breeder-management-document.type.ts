import type {
    BreederManagementApplicationFormRecord,
    BreederManagementAvailablePetRecord,
    BreederManagementParentPetRecord,
    BreederManagementRecentApplicationRecord,
    BreederManagementBreederStatsRecord,
    BreederManagementVerificationDocumentRecord,
} from '../application/ports/breeder-management-profile.port';
import type {
    BreederManagementPetRecord,
    BreederManagementReceivedApplicationRecord,
    BreederManagementReviewRecord,
} from '../application/ports/breeder-management-list-reader.port';

export type BreederManagementObjectIdLike = {
    toString(): string;
};

export type BreederManagementBannerDocumentRecord = {
    _id: BreederManagementObjectIdLike;
    imageFileName: string;
    bannerType?: 'login' | 'signup';
    linkType?: string;
    linkUrl?: string;
    title?: string;
    description?: string;
    order: number;
    isActive?: boolean;
};

export type BreederManagementApplicationDocumentRecord = BreederManagementReceivedApplicationRecord & {
    _id: BreederManagementObjectIdLike;
    adopterId?: {
        _id?: BreederManagementObjectIdLike;
        toString(): string;
    } | BreederManagementObjectIdLike;
    status?: string;
    appliedAt?: Date;
};

export type BreederManagementRecentApplicationDocumentRecord = BreederManagementRecentApplicationRecord & {
    _id: BreederManagementObjectIdLike;
};

export type BreederManagementPetDocumentRecord = BreederManagementPetRecord & {
    _id: BreederManagementObjectIdLike;
};

export type BreederManagementReviewDocumentRecord = BreederManagementReviewRecord & {
    _id: BreederManagementObjectIdLike;
    adopterId?: {
        _id?: BreederManagementObjectIdLike;
        name?: string;
        nickname?: string;
    };
};

export type BreederManagementVerificationRecord = {
    status?: string;
    plan?: string;
    level?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    documents?: BreederManagementVerificationDocumentRecord[];
    submittedByEmail?: boolean;
    [key: string]: unknown;
};

export type BreederManagementProfileRecord = {
    description?: string;
    location?: {
        city?: string;
        district?: string;
        address?: string;
    };
    representativePhotos?: string[];
    priceRange?: {
        min?: number;
        max?: number;
        display?: string;
    };
    specialization?: string[];
    experienceYears?: number;
    [key: string]: unknown;
};

export type BreederManagementStatsRecord = {
    totalApplications?: number;
    completedAdoptions?: number;
    averageRating?: number;
    totalReviews?: number;
    profileViews?: number;
};

export type BreederManagementBreederDocumentRecord = {
    _id: BreederManagementObjectIdLike;
    name: string;
    nickname?: string;
    emailAddress: string;
    phoneNumber?: string;
    socialAuthInfo?: {
        authProvider?: string;
    };
    marketingAgreed?: boolean;
    accountStatus?: string;
    petType?: string;
    profileImageFileName?: string | null;
    verification?: BreederManagementVerificationRecord;
    profile?: BreederManagementProfileRecord | null;
    breeds?: string[];
    applicationForm?: BreederManagementApplicationFormRecord[];
    stats?: BreederManagementBreederStatsRecord;
    consultationAgreed?: boolean;
};

export type BreederManagementPetCountAggregateRecord = {
    _id: BreederManagementObjectIdLike | string;
    count: number;
};

export type BreederManagementPaginationRecord = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export type BreederManagementBreederFilterRecord = {
    location?: string;
    breed?: string;
    priceMin?: number;
    priceMax?: number;
};

export type BreederManagementVerificationStatusCountRecord = {
    _id: string;
    count: number;
};

export type BreederManagementParentPetPersistencePayload = {
    breederId: BreederManagementObjectIdLike;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    photoFileName?: string;
    description?: string;
    photos: string[];
    isActive: boolean;
};

export type BreederManagementAvailablePetPersistencePayload = {
    breederId: BreederManagementObjectIdLike;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    price: number;
    status: string;
    photos: string[];
    description?: string;
    parentInfo?: {
        mother?: BreederManagementObjectIdLike;
        father?: BreederManagementObjectIdLike;
    };
};
