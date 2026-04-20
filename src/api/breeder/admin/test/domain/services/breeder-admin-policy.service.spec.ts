import { VerificationStatus } from '../../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { BreederAdminPolicyService } from '../../../domain/services/breeder-admin-policy.service';

describe('BreederAdminPolicyService', () => {
    const policy = new BreederAdminPolicyService();

    describe('assertCanManageBreeders', () => {
        it('권한 있으면 반환', () => {
            const admin = { permissions: { canManageBreeders: true } } as any;
            expect(policy.assertCanManageBreeders(admin)).toBe(admin);
        });
        it('권한 없으면 예외', () => {
            expect(() => policy.assertCanManageBreeders(null)).toThrow(DomainAuthorizationError);
            expect(() => policy.assertCanManageBreeders({ permissions: {} } as any)).toThrow(DomainAuthorizationError);
        });
    });

    describe('assertBreederExists', () => {
        it('존재하면 반환', () => {
            const breeder = { id: 'b-1' } as any;
            expect(policy.assertBreederExists(breeder)).toBe(breeder);
        });
        it('null이면 예외', () => {
            expect(() => policy.assertBreederExists(null)).toThrow(DomainValidationError);
        });
    });

    describe('assertSuspendable / assertUnsuspendable', () => {
        it('Suspendable: suspended가 아니면 통과', () => {
            expect(() => policy.assertSuspendable({ accountStatus: 'active' } as any)).not.toThrow();
        });
        it('Suspendable: suspended면 예외', () => {
            expect(() => policy.assertSuspendable({ accountStatus: 'suspended' } as any)).toThrow(DomainValidationError);
        });
        it('Unsuspendable: suspended면 통과', () => {
            expect(() => policy.assertUnsuspendable({ accountStatus: 'suspended' } as any)).not.toThrow();
        });
        it('Unsuspendable: suspended가 아니면 예외', () => {
            expect(() => policy.assertUnsuspendable({ accountStatus: 'active' } as any)).toThrow(DomainValidationError);
        });
    });

    describe('canSendReminder', () => {
        it('verification.status가 필수 상태와 일치하면 true', () => {
            expect(policy.canSendReminder({ verification: { status: VerificationStatus.PENDING } } as any, VerificationStatus.PENDING)).toBe(true);
        });
        it('다르면 false', () => {
            expect(policy.canSendReminder({ verification: { status: VerificationStatus.APPROVED } } as any, VerificationStatus.PENDING)).toBe(false);
        });
    });

    describe('getBreederNickname / getBreederBusinessName', () => {
        it('nickname > name > 브리더', () => {
            expect(policy.getBreederNickname({ nickname: '닉' } as any)).toBe('닉');
            expect(policy.getBreederNickname({ name: '이름' } as any)).toBe('이름');
            expect(policy.getBreederNickname({} as any)).toBe('브리더');
        });
        it('BusinessName은 name 우선', () => {
            expect(policy.getBreederBusinessName({ name: '이름', nickname: '닉' } as any)).toBe('이름');
            expect(policy.getBreederBusinessName({ nickname: '닉' } as any)).toBe('닉');
        });
    });
});
