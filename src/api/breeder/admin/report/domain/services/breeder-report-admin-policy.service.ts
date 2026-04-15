import { Injectable } from '@nestjs/common';

import { AdminAction } from '../../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../../common/error/domain.error';
import {
    BreederReportAdminAdminSnapshot,
    BreederReportAdminReportSnapshot,
} from '../../application/ports/breeder-report-admin-reader.port';

@Injectable()
export class BreederReportAdminPolicyService {
    assertCanManageBreeders(admin: BreederReportAdminAdminSnapshot | null): BreederReportAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canManageBreeders) {
            throw new DomainAuthorizationError('Access denied');
        }

        return admin;
    }

    assertReportExists(report: BreederReportAdminReportSnapshot | null): BreederReportAdminReportSnapshot {
        if (!report) {
            throw new DomainValidationError('신고를 찾을 수 없습니다.');
        }

        return report;
    }

    assertPendingReport(report: BreederReportAdminReportSnapshot): BreederReportAdminReportSnapshot {
        if (report.status !== 'pending') {
            throw new DomainValidationError('이미 처리된 신고입니다.');
        }

        return report;
    }

    resolveReportStatus(action: 'resolve' | 'reject'): 'resolved' | 'dismissed' {
        return action === 'resolve' ? 'resolved' : 'dismissed';
    }

    resolveAdminAction(action: 'resolve' | 'reject'): AdminAction {
        return action === 'resolve' ? AdminAction.RESOLVE_REPORT : AdminAction.DISMISS_REPORT;
    }

    createActivityDescription(action: 'resolve' | 'reject', adminNotes?: string): string {
        return action === 'resolve'
            ? `Report resolved: ${adminNotes || 'No notes'}`
            : `Report dismissed: ${adminNotes || 'No notes'}`;
    }

    createSuspensionReason(adminNotes?: string): string {
        return `신고 승인: ${adminNotes || '관리자 조치'}`;
    }

    getBreederDisplayName(report: BreederReportAdminReportSnapshot): string {
        return report.breederName || '브리더';
    }
}
