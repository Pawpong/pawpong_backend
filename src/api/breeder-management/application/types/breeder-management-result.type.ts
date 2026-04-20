import type { PageResult } from '../../../../common/types/page-result.type';

export type BreederManagementVerificationDocumentResult = {
    type: string;
    url: string;
    originalFileName?: string;
    uploadedAt?: Date;
};

export type BreederManagementVerificationInfoResult = {
    status?: string;
    plan?: string;
    level?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    submittedByEmail?: boolean;
    documents: BreederManagementVerificationDocumentResult[];
};

export type BreederManagementProfileInfoResult = Record<string, unknown> & {
    representativePhotos?: string[];
};

export type BreederManagementParentPetResult = Record<string, unknown> & {
    petId: string;
    photoFileName?: string | null;
    photos: string[];
};

export type BreederManagementAvailablePetResult = Record<string, unknown> & {
    petId: string;
    photos: string[];
};

export type BreederManagementProfileResult = {
    breederId: string;
    breederName: string;
    breederEmail: string;
    breederPhone?: string;
    authProvider: string;
    marketingAgreed: boolean;
    profileImageFileName?: string | null;
    accountStatus?: string;
    petType?: string;
    verificationInfo: BreederManagementVerificationInfoResult;
    profileInfo: BreederManagementProfileInfoResult | null | undefined;
    breeds: string[];
    parentPetInfo: BreederManagementParentPetResult[];
    availablePetInfo: BreederManagementAvailablePetResult[];
    applicationForm?: unknown;
    statsInfo?: unknown;
    consultationAgreed: boolean;
};

export type BreederManagementDashboardRecentApplicationResult = {
    applicationId: string;
    adopterName: string;
    petName: string;
    applicationStatus: string;
    appliedAt: Date;
};

export type BreederManagementDashboardResult = {
    profileInfo: {
        verificationInfo: {
            verificationStatus: string;
            subscriptionPlan: string;
            submittedAt?: Date;
            reviewedAt?: Date;
            rejectionReason?: string;
        };
    };
    statisticsInfo: {
        totalApplicationCount: number;
        pendingApplicationCount: number;
        completedAdoptionCount: number;
        averageRating: number;
        totalReviewCount: number;
        profileViewCount: number;
    };
    recentApplicationList: BreederManagementDashboardRecentApplicationResult[];
    availablePetCount: number;
};

export type BreederManagementMyPetItemResult = {
    petId: string;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    ageInMonths: number;
    price?: number;
    status?: string;
    isActive?: boolean;
    mainPhoto: string;
    photoCount: number;
    viewCount: number;
    applicationCount: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export type BreederManagementMyPetsPageResult = PageResult<BreederManagementMyPetItemResult> & {
    availableCount: number;
    reservedCount: number;
    adoptedCount: number;
    inactiveCount: number;
};

export type BreederManagementMyReviewItemResult = {
    reviewId: string;
    adopterId: string;
    adopterName: string;
    petName?: string;
    rating: number;
    petHealthRating?: number;
    communicationRating?: number;
    content: string;
    photos?: string[];
    writtenAt: Date;
    type?: string;
    isVisible?: boolean;
    reportCount?: number;
    replyContent?: string | null;
    replyWrittenAt?: Date | null;
    replyUpdatedAt?: Date | null;
};

export type BreederManagementMyReviewsPageResult = PageResult<BreederManagementMyReviewItemResult> & {
    averageRating: number;
    totalReviews: number;
    visibleReviews: number;
    hiddenReviews: number;
};

export type BreederManagementReceivedApplicationResult = {
    applicationId: string;
    adopterId: string;
    adopterName: string;
    adopterNickname: string;
    adopterEmail: string;
    adopterPhone: string;
    petId?: string;
    petName?: string;
    status: string;
    applicationData: unknown;
    preferredPetInfo?: string | null;
    additionalMessage?: string;
    appliedAt: Date | string;
    processedAt?: Date | string;
    breederNotes?: string;
};

export type BreederManagementReceivedApplicationsPageResult = PageResult<BreederManagementReceivedApplicationResult>;

export type BreederManagementApplicationDetailResult = {
    applicationId: string;
    adopterId: string;
    adopterName: string;
    adopterEmail: string;
    adopterPhone: string;
    petId?: string;
    petName?: string;
    status: string;
    standardResponses: Record<string, unknown>;
    customResponses: unknown[];
    appliedAt: string;
    processedAt?: string;
    breederNotes?: string;
};

export type BreederManagementVerificationStatusDocumentResult = {
    type: string;
    fileName: string;
    url: string;
    originalFileName?: string;
    uploadedAt?: Date;
};

export type BreederManagementVerificationStatusResult = {
    status: string;
    plan?: string;
    level?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    documents: BreederManagementVerificationStatusDocumentResult[];
    rejectionReason?: string;
    submittedByEmail: boolean;
};

export type BreederManagementUploadedDocumentResult = {
    type: string;
    url: string;
    fileName: string;
    size: number;
    originalFileName?: string;
};

export type BreederManagementUploadDocumentsResult = {
    count: number;
    level: string;
    documents: BreederManagementUploadedDocumentResult[];
};
