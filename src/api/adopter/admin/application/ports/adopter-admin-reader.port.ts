import { ApplicationStatus } from '../../../../../common/enum/user.enum';

export interface AdopterAdminAdminSnapshot {
    adminId: string;
    permissions: {
        canManageReports: boolean;
        canViewStatistics: boolean;
    };
}

export interface AdopterAdminReviewReportItemSnapshot {
    reviewId: string;
    breederId: string;
    breederName: string;
    authorId: string;
    authorName: string;
    reportedBy?: string;
    reporterName: string;
    reportReason?: string;
    reportDescription?: string;
    reportedAt?: Date;
    content: string;
    writtenAt: Date;
    isVisible: boolean;
}

export interface AdopterAdminReviewReportPageSnapshot {
    items: AdopterAdminReviewReportItemSnapshot[];
    totalCount: number;
    page: number;
    limit: number;
}

export interface AdopterAdminApplicationListFilterSnapshot {
    page: number;
    limit: number;
    status?: ApplicationStatus;
    breederName?: string;
    startDate?: string;
    endDate?: string;
}

export interface AdopterAdminApplicationListItemSnapshot {
    applicationId: string;
    adopterName: string;
    adopterEmail: string;
    adopterPhone: string;
    breederId: string;
    breederName: string;
    petName?: string;
    status: ApplicationStatus;
    appliedAt: Date;
    processedAt?: Date;
}

export interface AdopterAdminApplicationListSnapshot {
    items: AdopterAdminApplicationListItemSnapshot[];
    totalCount: number;
    pendingCount: number;
    completedCount: number;
    approvedCount: number;
    rejectedCount: number;
    page: number;
    limit: number;
}

export interface AdopterAdminApplicationDetailCustomResponseSnapshot {
    questionId: string;
    questionLabel: string;
    questionType: string;
    answer: any;
}

export interface AdopterAdminApplicationDetailSnapshot {
    applicationId: string;
    adopterName: string;
    adopterEmail: string;
    adopterPhone: string;
    breederId: string;
    breederName: string;
    petName?: string;
    status: ApplicationStatus;
    standardResponses: Record<string, any>;
    customResponses: AdopterAdminApplicationDetailCustomResponseSnapshot[];
    appliedAt: Date;
    processedAt?: Date;
    breederNotes?: string;
}

export const ADOPTER_ADMIN_READER = Symbol('ADOPTER_ADMIN_READER');

export interface AdopterAdminReaderPort {
    findAdminById(adminId: string): Promise<AdopterAdminAdminSnapshot | null>;
    findReportedReviews(page: number, limit: number): Promise<AdopterAdminReviewReportPageSnapshot>;
    findApplicationList(
        filter: AdopterAdminApplicationListFilterSnapshot,
    ): Promise<AdopterAdminApplicationListSnapshot>;
    findApplicationDetail(applicationId: string): Promise<AdopterAdminApplicationDetailSnapshot | null>;
}
