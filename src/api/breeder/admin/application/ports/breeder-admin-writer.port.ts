import { AdminTargetType } from '../../../../../common/enum/user.enum';
import { BreederAdminBreederSnapshot } from './breeder-admin-reader.port';

export interface BreederAdminBreederPatch {
    accountStatus?: string;
    suspensionReason?: string | undefined;
    suspendedAt?: Date | undefined;
    isTestAccount?: boolean;
}

export interface BreederAdminActivityLogEntry {
    logId: string;
    action: string;
    targetType: AdminTargetType;
    targetId: string;
    targetName?: string;
    description: string;
    performedAt: Date;
}

export const BREEDER_ADMIN_WRITER_PORT = Symbol('BREEDER_ADMIN_WRITER_PORT');

export interface BreederAdminWriterPort {
    updateBreeder(breederId: string, patch: BreederAdminBreederPatch): Promise<BreederAdminBreederSnapshot | null>;
    appendAdminActivityLog(adminId: string, logEntry: BreederAdminActivityLogEntry): Promise<void>;
}
