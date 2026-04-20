import { AdminAction, VerificationStatus } from '../../../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../../../common/error/domain.error';
import { BreederVerificationAdminPolicyService } from '../../../domain/services/breeder-verification-admin-policy.service';

describe('BreederVerificationAdminPolicyService', () => {
    const policy = new BreederVerificationAdminPolicyService();

    describe('assertCanManageBreeders', () => {
        it('권한 있으면 반환', () => {
            const admin = { permissions: { canManageBreeders: true } } as any;
            expect(policy.assertCanManageBreeders(admin, 'x')).toBe(admin);
        });
        it('권한 없으면 예외', () => {
            expect(() => policy.assertCanManageBreeders(null, 'x')).toThrow(DomainAuthorizationError);
        });
    });

    describe('assertBreederExists / assertVerificationRequestExists', () => {
        it('brder null이면 예외', () => {
            expect(() => policy.assertBreederExists(null)).toThrow(DomainValidationError);
        });
        it('verification 없으면 예외', () => {
            expect(() => policy.assertVerificationRequestExists({ id: 'b-1' } as any)).toThrow(DomainValidationError);
        });
    });

    describe('resolveAdminAction', () => {
        it('APPROVED → APPROVE_BREEDER', () => {
            expect(policy.resolveAdminAction(VerificationStatus.APPROVED)).toBe(AdminAction.APPROVE_BREEDER);
        });
        it('REJECTED → REJECT_BREEDER', () => {
            expect(policy.resolveAdminAction(VerificationStatus.REJECTED)).toBe(AdminAction.REJECT_BREEDER);
        });
        it('그 외 → REVIEW_BREEDER', () => {
            expect(policy.resolveAdminAction('pending')).toBe(AdminAction.REVIEW_BREEDER);
        });
    });

    describe('isLevelChangeApproval', () => {
        it('isLevelChangeRequested + levelChangeRequest + APPROVED → true', () => {
            const breeder = { verification: { isLevelChangeRequested: true, levelChangeRequest: {} } } as any;
            expect(policy.isLevelChangeApproval(breeder, VerificationStatus.APPROVED)).toBe(true);
        });
        it('상태 다르면 false', () => {
            const breeder = { verification: { isLevelChangeRequested: true, levelChangeRequest: {} } } as any;
            expect(policy.isLevelChangeApproval(breeder, VerificationStatus.REJECTED)).toBe(false);
        });
        it('플래그 없으면 false', () => {
            expect(policy.isLevelChangeApproval({ verification: {} } as any, VerificationStatus.APPROVED)).toBe(false);
        });
    });

    describe('shouldClearLevelChangeRequest', () => {
        it('APPROVED이면서 요청 있으면 true', () => {
            expect(policy.shouldClearLevelChangeRequest({ verification: { isLevelChangeRequested: true } } as any, VerificationStatus.APPROVED)).toBe(true);
        });
        it('REJECTED여도 true', () => {
            expect(policy.shouldClearLevelChangeRequest({ verification: { isLevelChangeRequested: true } } as any, VerificationStatus.REJECTED)).toBe(true);
        });
        it('요청 없으면 false', () => {
            expect(policy.shouldClearLevelChangeRequest({ verification: {} } as any, VerificationStatus.APPROVED)).toBe(false);
        });
    });

    describe('getBreederDisplayName', () => {
        it('nickname > name > 브리더', () => {
            expect(policy.getBreederDisplayName({ nickname: '닉' } as any)).toBe('닉');
            expect(policy.getBreederDisplayName({ name: '이름' } as any)).toBe('이름');
            expect(policy.getBreederDisplayName({} as any)).toBe('브리더');
        });
    });
});
