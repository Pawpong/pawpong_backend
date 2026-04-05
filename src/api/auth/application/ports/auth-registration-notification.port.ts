export const AUTH_REGISTRATION_NOTIFICATION_PORT = Symbol('AUTH_REGISTRATION_NOTIFICATION_PORT');

export interface AuthRegistrationDocumentNotificationItem {
    type: string;
    fileName: string;
    originalFileName?: string;
}

export interface AuthRegistrationNotificationPort {
    notifyAdopterRegistered(input: {
        userId: string;
        email: string;
        nickname: string;
        phone?: string;
        registrationType: 'email' | 'social';
        provider?: string;
    }): Promise<void>;
    notifyBreederRegistered(input: {
        userId: string;
        email: string;
        name: string;
        phone?: string;
        registrationType: 'email' | 'social';
        provider?: string;
    }): Promise<void>;
    notifyBreederDocumentsSubmitted(input: {
        userId: string;
        email: string;
        name: string;
        documents: AuthRegistrationDocumentNotificationItem[];
    }): Promise<void>;
}
