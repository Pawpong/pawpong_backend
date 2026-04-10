import type { PageResult } from '../../../../../../common/types/page-result.type';

export type BreederVerificationInfoResult = {
    verificationStatus: string;
    subscriptionPlan: string;
    level: string;
    submittedAt?: Date;
    isSubmittedByEmail?: boolean;
    previousLevel?: string;
    isLevelChange?: boolean;
};

export type BreederVerificationListItemResult = {
    breederId: string;
    breederName: string;
    emailAddress: string;
    phoneNumber?: string;
    accountStatus?: string;
    isTestAccount?: boolean;
    verificationInfo: BreederVerificationInfoResult;
    profileInfo?: any;
    createdAt: Date;
};

export type BreederVerificationPageResult = PageResult<BreederVerificationListItemResult>;

export type BreederDetailDocumentResult = {
    type: string;
    fileName: string;
    fileUrl?: string;
    uploadedAt: Date;
};

export type BreederDetailResult = {
    breederId: string;
    email: string;
    nickname: string;
    phone?: string;
    businessNumber?: string;
    businessName?: string;
    verificationInfo: {
        verificationStatus: string;
        subscriptionPlan: string;
        level: string;
        submittedAt?: Date;
        processedAt?: Date;
        isSubmittedByEmail?: boolean;
        documents?: BreederDetailDocumentResult[];
        rejectionReason?: string;
    };
    profileInfo?: {
        location?: string;
        detailedLocation?: string;
        specialization?: string[];
        breeds?: string[];
        description?: string;
        experienceYears?: number;
    };
    createdAt: Date;
    updatedAt: Date;
};

export type BreederLevelChangeResult = {
    breederId: string;
    breederName: string;
    previousLevel: string;
    newLevel: string;
    changedAt: Date;
    changedBy: string;
};

export type BreederStatsResult = {
    totalApproved: number;
    eliteCount: number;
    newCount: number;
};

export type BreederDocumentReminderResult = {
    sentCount: number;
    breederIds: string[];
};
