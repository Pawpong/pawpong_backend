import { BadRequestException } from '@nestjs/common';

import { SendPhoneVerificationCodeUseCase } from './send-phone-verification-code.use-case';
import { AuthPhoneVerificationPolicyService } from '../../domain/services/auth-phone-verification-policy.service';

describe('전화번호 인증 코드 발송 유스케이스', () => {
    const authPhoneVerificationRegistryPort = {
        isPhoneWhitelisted: jest.fn(),
        hasRegisteredPhone: jest.fn(),
    };
    const authPhoneVerificationStorePort = {
        get: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        cleanupExpired: jest.fn(),
    };
    const authPhoneVerificationSenderPort = {
        sendVerificationCode: jest.fn(),
    };

    let policyService: AuthPhoneVerificationPolicyService;
    let useCase: SendPhoneVerificationCodeUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        policyService = new AuthPhoneVerificationPolicyService();
        useCase = new SendPhoneVerificationCodeUseCase(
            authPhoneVerificationRegistryPort as any,
            authPhoneVerificationStorePort as any,
            authPhoneVerificationSenderPort as any,
            policyService,
        );
    });

    it('전화번호 인증코드를 발송하고 저장한다', async () => {
        jest.spyOn(policyService, 'generateVerificationCode').mockReturnValue('123456');
        authPhoneVerificationRegistryPort.isPhoneWhitelisted.mockResolvedValue(false);
        authPhoneVerificationRegistryPort.hasRegisteredPhone.mockResolvedValue(false);
        authPhoneVerificationStorePort.get.mockReturnValue(undefined);
        authPhoneVerificationSenderPort.sendVerificationCode.mockResolvedValue({ success: true });

        const result = await useCase.execute('010-1234-5678');

        expect(authPhoneVerificationSenderPort.sendVerificationCode).toHaveBeenCalledWith('01012345678', '123456');
        expect(authPhoneVerificationStorePort.save).toHaveBeenCalledWith(
            expect.objectContaining({
                phone: '01012345678',
                code: '123456',
                attempts: 0,
                verified: false,
            }),
        );
        expect(result).toEqual({
            success: true,
            message: '인증번호가 발송되었습니다.',
        });
    });

    it('이미 등록된 전화번호면 예외를 던진다', async () => {
        authPhoneVerificationRegistryPort.isPhoneWhitelisted.mockResolvedValue(false);
        authPhoneVerificationRegistryPort.hasRegisteredPhone.mockResolvedValue(true);

        await expect(useCase.execute('01012345678')).rejects.toThrow(
            new BadRequestException('이미 등록된 전화번호입니다.'),
        );
    });

    it('기존 인증코드가 유효하면 재발송을 막는다', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-04-07T00:00:00.000Z').getTime());
        authPhoneVerificationRegistryPort.isPhoneWhitelisted.mockResolvedValue(false);
        authPhoneVerificationRegistryPort.hasRegisteredPhone.mockResolvedValue(false);
        authPhoneVerificationStorePort.get.mockReturnValue({
            phone: '01012345678',
            code: '123456',
            expiresAt: new Date('2026-04-07T00:02:00.000Z'),
            attempts: 0,
            verified: false,
        });

        await expect(useCase.execute('01012345678')).rejects.toThrow(
            new BadRequestException('이미 발송된 인증코드가 있습니다. 2분 후에 재발송 가능합니다.'),
        );
    });
});
