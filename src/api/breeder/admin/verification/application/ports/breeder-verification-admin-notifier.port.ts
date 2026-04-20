export interface BreederVerificationAdminNotificationRecipient {
    breederId: string;
    breederName: string;
    emailAddress?: string;
}

export const BREEDER_VERIFICATION_ADMIN_NOTIFIER_PORT = Symbol('BREEDER_VERIFICATION_ADMIN_NOTIFIER_PORT');

export interface BreederVerificationAdminNotifierPort {
    sendApproval(recipient: BreederVerificationAdminNotificationRecipient): Promise<void>;
    sendRejection(recipient: BreederVerificationAdminNotificationRecipient, rejectionReason?: string): Promise<void>;
    sendDocumentReminder(recipient: BreederVerificationAdminNotificationRecipient): Promise<void>;
}
