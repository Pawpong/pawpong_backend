import { DomainConflictError, DomainValidationError } from '../../../../../common/error/domain.error';
import { AuthSignupValidationService } from '../../../domain/services/auth-signup-validation.service';

describe('AuthSignupValidationService', () => {
    const service = new AuthSignupValidationService();

    describe('ensureAdopterRegistrationInput', () => {
        it('email 없으면 예외', () => {
            expect(() => service.ensureAdopterRegistrationInput(undefined, '닉')).toThrow(DomainValidationError);
        });
        it('nickname 없으면 예외', () => {
            expect(() => service.ensureAdopterRegistrationInput('a@b.com', undefined)).toThrow(DomainValidationError);
        });
    });

    describe('ensureRequiredBreederAgreements', () => {
        it('termsOfService 동의 없으면 예외', () => {
            expect(() => service.ensureRequiredBreederAgreements({ privacyPolicy: true })).toThrow(
                DomainValidationError,
            );
        });
        it('privacyPolicy 동의 없으면 예외', () => {
            expect(() => service.ensureRequiredBreederAgreements({ termsOfService: true })).toThrow(
                DomainValidationError,
            );
        });
        it('둘 다 있으면 통과', () => {
            expect(() =>
                service.ensureRequiredBreederAgreements({ termsOfService: true, privacyPolicy: true }),
            ).not.toThrow();
        });
    });

    describe('중복 검사 메서드들', () => {
        it('assertAdopterSocialAccountAvailable: 있으면 conflict', () => {
            expect(() => service.assertAdopterSocialAccountAvailable({ id: 'a' })).toThrow(DomainConflictError);
        });
        it('assertAdopterNicknameAvailable: 있으면 conflict', () => {
            expect(() => service.assertAdopterNicknameAvailable({ id: 'a' })).toThrow(DomainConflictError);
        });
        it('assertBreederEmailAvailable: 있으면 conflict', () => {
            expect(() => service.assertBreederEmailAvailable({ id: 'a' })).toThrow(DomainConflictError);
        });
        it('assertBreederAdopterEmailAvailable: 있으면 conflict', () => {
            expect(() => service.assertBreederAdopterEmailAvailable({ id: 'a' })).toThrow(DomainConflictError);
        });
    });

    describe('ensureCompleteSocialAdopterInput', () => {
        it('nickname 없으면 예외', () => {
            expect(() => service.ensureCompleteSocialAdopterInput(undefined)).toThrow(DomainValidationError);
        });
    });

    describe('ensureCompleteSocialBreederInput', () => {
        const valid = {
            phone: '010',
            breederName: 'b',
            city: '서울',
            petType: 'dog',
            breeds: ['푸들'],
            plan: 'pro',
            level: 'new',
        };
        it('모든 필드가 있으면 통과', () => {
            expect(() => service.ensureCompleteSocialBreederInput(valid as any)).not.toThrow();
        });
        it('phone 없으면 예외', () => {
            expect(() => service.ensureCompleteSocialBreederInput({ ...valid, phone: undefined } as any)).toThrow(
                /전화번호/,
            );
        });
        it('breeds 빈 배열이면 예외', () => {
            expect(() => service.ensureCompleteSocialBreederInput({ ...valid, breeds: [] } as any)).toThrow(/품종/);
        });
    });

    describe('ensureLegacyBreederInput', () => {
        it('breederName/district 없으면 예외', () => {
            expect(() => service.ensureLegacyBreederInput(undefined, '강남', ['푸들'])).toThrow();
        });
        it('breeds 없으면 예외', () => {
            expect(() => service.ensureLegacyBreederInput('b', '강남', [])).toThrow();
        });
    });

    it('throwInvalidRole은 예외', () => {
        expect(() => service.throwInvalidRole()).toThrow(DomainValidationError);
    });
});
