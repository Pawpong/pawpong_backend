export type BreederAdminSuspensionResult = {
    breederId: string;
    reason?: string;
    suspendedAt?: Date;
    notificationSent: boolean;
};

export type BreederAdminReminderResult = {
    totalCount: number;
    successCount: number;
    failCount: number;
    successIds: string[];
    failIds: string[];
    sentAt: Date;
};

export type BreederAdminTestAccountResult = {
    breederId: string;
    breederName: string;
    isTestAccount: boolean;
    updatedAt: Date;
};
