import { AdminAction } from '../../../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../../../common/error/domain.error';
import { BreederReportAdminPolicyService } from '../../../domain/services/breeder-report-admin-policy.service';

describe('BreederReportAdminPolicyService', () => {
    const policy = new BreederReportAdminPolicyService();

    describe('assertCanManageBreeders', () => {
        it('권한 있으면 반환', () => {
            const admin = { permissions: { canManageBreeders: true } } as any;
            expect(policy.assertCanManageBreeders(admin)).toBe(admin);
        });
        it('없으면 예외', () => {
            expect(() => policy.assertCanManageBreeders(null)).toThrow(DomainAuthorizationError);
        });
    });

    describe('assertReportExists / assertPendingReport', () => {
        it('report null → 예외', () => {
            expect(() => policy.assertReportExists(null)).toThrow(DomainValidationError);
        });
        it('status !== pending → 예외', () => {
            expect(() => policy.assertPendingReport({ status: 'resolved' } as any)).toThrow(DomainValidationError);
        });
        it('status === pending → 통과', () => {
            const report = { status: 'pending' } as any;
            expect(policy.assertPendingReport(report)).toBe(report);
        });
    });

    describe('resolveReportStatus / resolveAdminAction', () => {
        it('resolve → resolved/RESOLVE_REPORT', () => {
            expect(policy.resolveReportStatus('resolve')).toBe('resolved');
            expect(policy.resolveAdminAction('resolve')).toBe(AdminAction.RESOLVE_REPORT);
        });
        it('reject → dismissed/DISMISS_REPORT', () => {
            expect(policy.resolveReportStatus('reject')).toBe('dismissed');
            expect(policy.resolveAdminAction('reject')).toBe(AdminAction.DISMISS_REPORT);
        });
    });

    describe('createActivityDescription / createSuspensionReason', () => {
        it('resolve description', () => {
            expect(policy.createActivityDescription('resolve', 'notes')).toContain('resolved');
            expect(policy.createActivityDescription('reject')).toContain('No notes');
        });
        it('suspension reason', () => {
            expect(policy.createSuspensionReason('notes')).toBe('신고 승인: notes');
            expect(policy.createSuspensionReason()).toBe('신고 승인: 관리자 조치');
        });
    });

    describe('getBreederDisplayName', () => {
        it('breederName이 있으면 반환', () => {
            expect(policy.getBreederDisplayName({ breederName: '브리더A' } as any)).toBe('브리더A');
        });
        it('없으면 브리더', () => {
            expect(policy.getBreederDisplayName({} as any)).toBe('브리더');
        });
    });
});
