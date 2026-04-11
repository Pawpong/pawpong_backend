export type AdopterAccountRecord = {
    emailAddress: string;
    nickname?: string;
    accountStatus?: string;
};

export type AdopterDeleteAccountCommand = {
    userId: string;
    deletedAt: Date;
    reason: string;
    otherReason?: string;
};

export const ADOPTER_ACCOUNT_COMMAND_PORT = Symbol('ADOPTER_ACCOUNT_COMMAND_PORT');

export interface AdopterAccountCommandPort {
    findAdopterById(userId: string): Promise<AdopterAccountRecord | null>;
    softDeleteAdopter(command: AdopterDeleteAccountCommand): Promise<void>;
    notifyAdopterWithdrawal(command: AdopterDeleteAccountCommand, adopter: AdopterAccountRecord): Promise<void>;
}
