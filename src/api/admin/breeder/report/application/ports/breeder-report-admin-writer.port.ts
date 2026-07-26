import { AdminAction, AdminTargetType } from '../../../../../../common/enum/user.enum';

export const BREEDER_REPORT_ADMIN_WRITER_PORT = Symbol('BREEDER_REPORT_ADMIN_WRITER_PORT');

export interface BreederReportAdminActivityLogEntry {
    logId: string;
    action: AdminAction;
    targetType: AdminTargetType;
    targetId: string;
    targetName?: string;
    description: string;
    performedAt: Date;
}

export interface BreederReportAdminReportPatch {
    status: string;
    adminNotes?: string;
    suspensionReason?: string;
    suspendedAt?: Date;
}

export interface BreederReportAdminWriterPort {
    updateReport(breederId: string, reportId: string, patch: BreederReportAdminReportPatch): Promise<void>;
    appendAdminActivityLog(adminId: string, logEntry: BreederReportAdminActivityLogEntry): Promise<void>;
}
