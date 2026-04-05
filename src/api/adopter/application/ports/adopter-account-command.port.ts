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

export abstract class AdopterAccountCommandPort {
    abstract findAdopterById(userId: string): Promise<AdopterAccountRecord | null>;
    abstract softDeleteAdopter(command: AdopterDeleteAccountCommand): Promise<void>;
    abstract notifyAdopterWithdrawal(command: AdopterDeleteAccountCommand, adopter: AdopterAccountRecord): Promise<void>;
}
