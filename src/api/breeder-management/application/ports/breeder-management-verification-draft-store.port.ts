export type BreederManagementVerificationDraftDocument = {
    type: string;
    fileName: string;
    originalFileName?: string;
};

export abstract class BreederManagementVerificationDraftStorePort {
    abstract save(userId: string, documents: BreederManagementVerificationDraftDocument[]): Promise<void>;
    abstract get(userId: string): Promise<BreederManagementVerificationDraftDocument[]>;
    abstract delete(userId: string): Promise<void>;
}
