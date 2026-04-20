import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';

export interface AdopterAdminActivityLogEntry {
    logId: string;
    action: AdminAction;
    targetType: AdminTargetType;
    targetId: string;
    targetName?: string;
    description: string;
    performedAt: Date;
}

export interface AdopterAdminDeletedReviewSnapshot {
    reviewId: string;
    breederId: string;
    breederName: string;
}

export const ADOPTER_ADMIN_WRITER_PORT = Symbol('ADOPTER_ADMIN_WRITER_PORT');

export interface AdopterAdminWriterPort {
    hideReview(breederId: string, reviewId: string): Promise<AdopterAdminDeletedReviewSnapshot | null>;
    appendAdminActivity(adminId: string, logEntry: AdopterAdminActivityLogEntry): Promise<void>;
}
