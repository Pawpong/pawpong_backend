export type BreederManagementVerificationDraftDocument = {
    type: string;
    fileName: string;
    originalFileName?: string;
};

export const BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT = Symbol(
    'BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT',
);

export interface BreederManagementVerificationDraftStorePort {
    save(userId: string, documents: BreederManagementVerificationDraftDocument[]): Promise<void>;
    get(userId: string): Promise<BreederManagementVerificationDraftDocument[]>;
    delete(userId: string): Promise<void>;
}
