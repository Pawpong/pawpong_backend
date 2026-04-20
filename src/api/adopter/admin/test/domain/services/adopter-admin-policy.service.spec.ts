import { DomainAuthorizationError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { AdopterAdminPolicyService } from '../../../domain/services/adopter-admin-policy.service';

describe('AdopterAdminPolicyService', () => {
    const policy = new AdopterAdminPolicyService();

    describe('assertCanManageReports', () => {
        it('권한 있으면 반환', () => {
            const admin = { adminId: 'a', permissions: { canManageReports: true } } as any;
            expect(policy.assertCanManageReports(admin)).toBe(admin);
        });
        it('없으면 DomainAuthorizationError', () => {
            expect(() => policy.assertCanManageReports(null)).toThrow(DomainAuthorizationError);
            expect(() => policy.assertCanManageReports({ permissions: {} } as any)).toThrow(DomainAuthorizationError);
        });
    });

    describe('assertCanViewStatistics', () => {
        it('권한 있으면 반환', () => {
            const admin = { adminId: 'a', permissions: { canViewStatistics: true } } as any;
            expect(policy.assertCanViewStatistics(admin)).toBe(admin);
        });
        it('없으면 DomainAuthorizationError', () => {
            expect(() => policy.assertCanViewStatistics(null)).toThrow(DomainAuthorizationError);
        });
    });

    describe('assertReviewExists / assertApplicationExists', () => {
        it('존재하면 반환', () => {
            const review = { reviewId: 'r-1' } as any;
            expect(policy.assertReviewExists(review)).toBe(review);
            const app = { applicationId: 'app-1' } as any;
            expect(policy.assertApplicationExists(app)).toBe(app);
        });
        it('null이면 DomainValidationError', () => {
            expect(() => policy.assertReviewExists(null)).toThrow(DomainValidationError);
            expect(() => policy.assertApplicationExists(null)).toThrow(DomainValidationError);
        });
    });
});
