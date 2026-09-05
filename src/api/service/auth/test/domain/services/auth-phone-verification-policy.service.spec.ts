import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { AuthPhoneVerificationPolicyService } from '../../../domain/services/auth-phone-verification-policy.service';

describe('AuthPhoneVerificationPolicyService', () => {
    const policy = new AuthPhoneVerificationPolicyService();

    describe('normalizePhoneNumber', () => {
        it('올바른 전화번호를 정규화한다', () => {
            expect(policy.normalizePhoneNumber('010-1234-5678')).toBe('01012345678');
        });
        it('형식이 틀리면 예외', () => {
            expect(() => policy.normalizePhoneNumber('02-1234-5678')).toThrow(DomainValidationError);
        });
    });

    it('generateVerificationCode는 6자리 숫자', () => {
        const code = policy.generateVerificationCode();
        expect(code).toMatch(/^\d{6}$/);
    });

    it('createPendingVerification: expiresAt ~ 3분 후, attempts=0', () => {
        const record = policy.createPendingVerification('01012345678', '123456');
        expect(record.attempts).toBe(0);
        expect(record.verified).toBe(false);
        const diff = record.expiresAt.getTime() - Date.now();
        expect(diff).toBeGreaterThan(2 * 60 * 1000);
        expect(diff).toBeLessThanOrEqual(3 * 60 * 1000);
    });

    describe('isExpired', () => {
        it('과거 시간은 true', () => {
            expect(policy.isExpired(new Date(Date.now() - 1000))).toBe(true);
        });
        it('미래 시간은 false', () => {
            expect(policy.isExpired(new Date(Date.now() + 60 * 1000))).toBe(false);
        });
    });

    describe('ensurePhoneAvailable', () => {
        it('whitelist=false + registered면 예외', () => {
            expect(() => policy.ensurePhoneAvailable(false, true)).toThrow(DomainValidationError);
        });
        it('whitelist=true면 이미 등록된 전화번호도 통과', () => {
            expect(() => policy.ensurePhoneAvailable(true, true)).not.toThrow();
        });
    });

    describe('ensureNoPendingVerification', () => {
        it('만료되지 않은 verification이 있으면 예외', () => {
            const vc = { expiresAt: new Date(Date.now() + 60 * 1000) } as any;
            expect(() => policy.ensureNoPendingVerification(vc)).toThrow(DomainValidationError);
        });
        it('만료된 verification은 통과', () => {
            const vc = { expiresAt: new Date(Date.now() - 60 * 1000) } as any;
            expect(() => policy.ensureNoPendingVerification(vc)).not.toThrow();
        });
        it('undefined도 통과', () => {
            expect(() => policy.ensureNoPendingVerification(undefined)).not.toThrow();
        });
    });

    describe('ensureVerificationRequested', () => {
        it('undefined면 예외', () => {
            expect(() => policy.ensureVerificationRequested(undefined)).toThrow(DomainValidationError);
        });
    });

    describe('ensureNotVerified', () => {
        it('verified=true면 예외', () => {
            expect(() => policy.ensureNotVerified({ verified: true } as any)).toThrow(DomainValidationError);
        });
    });

    describe('attempts 관련', () => {
        it('isWithinMaxAttempts: 5 이하 true, 6 false', () => {
            expect(policy.isWithinMaxAttempts(5)).toBe(true);
            expect(policy.isWithinMaxAttempts(6)).toBe(false);
        });
        it('getMaxAttempts는 5', () => {
            expect(policy.getMaxAttempts()).toBe(5);
        });
        it('throwAttemptsExceeded/throwInvalidCode/throwExpiredVerification은 예외', () => {
            expect(() => policy.throwAttemptsExceeded()).toThrow(DomainValidationError);
            expect(() => policy.throwInvalidCode(3)).toThrow(/3\/5/);
            expect(() => policy.throwExpiredVerification()).toThrow(DomainValidationError);
        });
    });
});
