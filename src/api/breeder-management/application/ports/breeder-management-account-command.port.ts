export const BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT = Symbol('BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT');

export interface BreederManagementAccountRecord {
    emailAddress: string;
    name?: string;
    nickname?: string;
    accountStatus?: string;
}

export interface BreederManagementDeleteAccountCommand {
    userId: string;
    deletedAt: Date;
    reason?: string;
    otherReason?: string;
}

export interface BreederManagementAccountCommandPort {
    findBreederById(userId: string): Promise<BreederManagementAccountRecord | null>;
    countPendingApplications(userId: string): Promise<number>;
    softDeleteBreeder(command: BreederManagementDeleteAccountCommand): Promise<void>;
    deactivateAllAvailablePetsByBreeder(userId: string): Promise<number>;
    notifyBreederWithdrawal(
        command: BreederManagementDeleteAccountCommand,
        breeder: BreederManagementAccountRecord,
    ): Promise<void>;
}
