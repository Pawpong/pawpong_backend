import { BadRequestException } from '@nestjs/common';

import { VerifyPhoneVerificationCodeUseCase } from './verify-phone-verification-code.use-case';
import { AuthCommandResponseFactoryService } from '../../domain/services/auth-command-response-factory.service';
import { AuthPhoneVerificationPolicyService } from '../../domain/services/auth-phone-verification-policy.service';

describe('VerifyPhoneVerificationCodeUseCase', () => {
    const authPhoneVerificationStorePort = {
        get: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        cleanupExpired: jest.fn(),
    };

    let useCase: VerifyPhoneVerificationCodeUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new VerifyPhoneVerificationCodeUseCase(
            authPhoneVerificationStorePort as any,
            new AuthPhoneVerificationPolicyService(),
            new AuthCommandResponseFactoryService(),
        );
    });

    it('인증코드가 일치하면 인증 완료 처리한다', () => {
        authPhoneVerificationStorePort.get.mockReturnValue({
            phone: '01012345678',
            code: '123456',
            expiresAt: new Date(Date.now() + 60_000),
            attempts: 0,
            verified: false,
        });

        const result = useCase.execute('01012345678', '123456');

        expect(authPhoneVerificationStorePort.save).toHaveBeenCalledWith(
            expect.objectContaining({
                verified: true,
                attempts: 1,
            }),
        );
        expect(result).toEqual({
            success: true,
            message: '전화번호 인증이 완료되었습니다.',
        });
    });

    it('인증코드가 틀리면 시도 횟수를 증가시키고 예외를 던진다', () => {
        authPhoneVerificationStorePort.get.mockReturnValue({
            phone: '01012345678',
            code: '123456',
            expiresAt: new Date(Date.now() + 60_000),
            attempts: 0,
            verified: false,
        });

        expect(() => useCase.execute('01012345678', '000000')).toThrow(
            new BadRequestException('인증번호가 일치하지 않습니다. (1/5)'),
        );
        expect(authPhoneVerificationStorePort.save).toHaveBeenCalledWith(
            expect.objectContaining({
                attempts: 1,
                verified: false,
            }),
        );
    });

    it('인증 시도 횟수를 초과하면 인증 정보를 제거한다', () => {
        authPhoneVerificationStorePort.get.mockReturnValue({
            phone: '01012345678',
            code: '123456',
            expiresAt: new Date(Date.now() + 60_000),
            attempts: 5,
            verified: false,
        });

        expect(() => useCase.execute('01012345678', '000000')).toThrow(
            new BadRequestException('인증 시도 횟수를 초과했습니다. 다시 요청해주세요.'),
        );
        expect(authPhoneVerificationStorePort.delete).toHaveBeenCalledWith('01012345678');
    });

    it('만료된 인증코드는 제거하고 예외를 던진다', () => {
        authPhoneVerificationStorePort.get.mockReturnValue({
            phone: '01012345678',
            code: '123456',
            expiresAt: new Date(Date.now() - 60_000),
            attempts: 0,
            verified: false,
        });

        expect(() => useCase.execute('01012345678', '123456')).toThrow(
            new BadRequestException('인증번호가 만료되었습니다. 다시 요청해주세요.'),
        );
        expect(authPhoneVerificationStorePort.delete).toHaveBeenCalledWith('01012345678');
    });
});
