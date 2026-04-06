export const AUTH_BREEDER_VERIFICATION_COMMAND_PORT = Symbol('AUTH_BREEDER_VERIFICATION_COMMAND_PORT');

export type AuthBreederVerificationDocumentRecord = {
    type: string;
    url: string;
    uploadedAt: Date;
};

export type AuthBreederVerificationBreederRecord = {
    _id: { toString(): string };
};

export abstract class AuthBreederVerificationCommandPort {
    abstract findBreederById(userId: string): Promise<AuthBreederVerificationBreederRecord | null>;
    abstract updateVerificationDocuments(
        userId: string,
        documents: AuthBreederVerificationDocumentRecord[],
        level: string,
        status: string,
        submittedAt: Date,
    ): Promise<void>;
}
