export type AuthRegistrationDocumentNotificationItem = {
    type: string;
    fileName: string;
    originalFileName?: string;
};

export abstract class AuthRegistrationNotificationPort {
    abstract notifyAdopterRegistered(input: {
        userId: string;
        email: string;
        nickname: string;
        phone?: string;
        registrationType: 'email' | 'social';
        provider?: string;
    }): Promise<void>;
    abstract notifyBreederRegistered(input: {
        userId: string;
        email: string;
        name: string;
        phone?: string;
        registrationType: 'email' | 'social';
        provider?: string;
    }): Promise<void>;
    abstract notifyBreederDocumentsSubmitted(input: {
        userId: string;
        email: string;
        name: string;
        documents: AuthRegistrationDocumentNotificationItem[];
    }): Promise<void>;
}
