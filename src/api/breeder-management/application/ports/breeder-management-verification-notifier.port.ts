export type BreederManagementVerificationNotificationDocument = {
    type: string;
    url: string;
    originalFileName?: string;
};

export type BreederManagementVerificationSubmissionNotification = {
    breederId: string;
    breederName: string;
    email: string;
    phone?: string;
    level: 'new' | 'elite';
    isResubmission: boolean;
    submittedAt: Date;
    documents: BreederManagementVerificationNotificationDocument[];
};

export abstract class BreederManagementVerificationNotifierPort {
    abstract notifySubmission(payload: BreederManagementVerificationSubmissionNotification): Promise<void>;
}
