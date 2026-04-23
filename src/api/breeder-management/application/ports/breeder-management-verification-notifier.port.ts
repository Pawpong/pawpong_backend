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

export const BREEDER_MANAGEMENT_VERIFICATION_NOTIFIER_PORT = Symbol('BREEDER_MANAGEMENT_VERIFICATION_NOTIFIER_PORT');

export interface BreederManagementVerificationNotifierPort {
    notifySubmission(payload: BreederManagementVerificationSubmissionNotification): Promise<void>;
}
