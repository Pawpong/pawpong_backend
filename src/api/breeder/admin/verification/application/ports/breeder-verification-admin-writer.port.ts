import { AdminAction, AdminTargetType } from '../../../../../../common/enum/user.enum';

export interface BreederVerificationAdminLevelChangeHistoryEntry {
    previousLevel: string;
    newLevel: string;
    requestedAt: Date;
    approvedAt: Date;
    approvedBy: string;
}

export interface BreederVerificationAdminUpdateVerificationCommand {
    verificationStatus: string;
    reviewedAt: Date;
    rejectionReason?: string;
    appendLevelChangeHistory?: BreederVerificationAdminLevelChangeHistoryEntry;
    clearLevelChangeRequest?: boolean;
}

export interface BreederVerificationAdminActivityLogEntry {
    logId: string;
    action: AdminAction;
    targetType: AdminTargetType;
    targetId: string;
    targetName?: string;
    description: string;
    performedAt: Date;
}

export const BREEDER_VERIFICATION_ADMIN_WRITER_PORT = Symbol('BREEDER_VERIFICATION_ADMIN_WRITER_PORT');

export interface BreederVerificationAdminWriterPort {
    updateBreederVerification(
        breederId: string,
        command: BreederVerificationAdminUpdateVerificationCommand,
    ): Promise<void>;
    updateBreederLevel(breederId: string, newLevel: string): Promise<void>;
    appendAdminActivityLog(adminId: string, logEntry: BreederVerificationAdminActivityLogEntry): Promise<void>;
}
