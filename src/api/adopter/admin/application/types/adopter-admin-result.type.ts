import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import type { PageResult } from '../../../../../common/types/page-result.type';
import type {
    AdopterApplicationAnswerValue,
    AdopterApplicationStandardResponsesRecord,
} from '../../../types/adopter-application.type';

export type AdopterAdminApplicationListItemResult = {
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
};

export type AdopterAdminApplicationListResult = {
    applications: AdopterAdminApplicationListItemResult[];
    totalCount: number;
    pendingCount: number;
    completedCount: number;
    approvedCount: number;
    rejectedCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
};

export type AdopterAdminStandardResponsesResult = AdopterApplicationStandardResponsesRecord;

export type AdopterAdminCustomResponseResult = {
    questionId: string;
    questionLabel: string;
    questionType: string;
    answer: AdopterApplicationAnswerValue;
};

export type AdopterAdminApplicationDetailResult = {
    applicationId: string;
    adopterName: string;
    adopterEmail: string;
    adopterPhone: string;
    breederId: string;
    breederName: string;
    petName?: string;
    status: ApplicationStatus;
    standardResponses: AdopterAdminStandardResponsesResult;
    customResponses: AdopterAdminCustomResponseResult[];
    appliedAt: Date;
    processedAt?: Date;
    breederNotes?: string;
};

export type AdopterAdminReviewReportItemResult = {
    reviewId: string;
    breederId: string;
    breederName: string;
    authorId: string;
    authorName: string;
    reportedBy: string;
    reporterName: string;
    reportReason: string;
    reportDescription: string;
    reportedAt: Date;
    content: string;
    writtenAt: Date;
    isVisible: boolean;
};

export type AdopterAdminReviewReportPageResult = PageResult<AdopterAdminReviewReportItemResult>;

export type AdopterAdminReviewDeleteResult = {
    reviewId: string;
    breederId: string;
    breederName: string;
    deleteReason: string;
    deletedAt: string;
    message: string;
};
