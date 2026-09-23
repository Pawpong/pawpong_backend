import { Test } from '@nestjs/testing';
import { AuthAppleLoginController } from '../../controller/auth-apple-login.controller';
import { AuthAppleIdTokenService } from '../../domain/services/auth-apple-id-token.service';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
} from '../../application/tokens/auth-social-flow.token';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AppleCredentialService } from '../application/apple-credential.service';
import { AuthSocialCallbackResponseInterceptor } from '../../presentation/interceptors/auth-social-callback-response.interceptor';

describe('Apple callback credential capture boundary', () => {
    const flow = { execute: jest.fn() };
    const credentials = { capture: jest.fn() };
    let controller: AuthAppleLoginController;
    beforeEach(async () => {
        jest.resetAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                AuthAppleLoginController,
                { provide: GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY, useValue: { execute: jest.fn() } },
                { provide: PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW, useValue: flow },
                {
                    provide: AuthAppleIdTokenService,
                    useValue: {
                        verify: jest.fn().mockResolvedValue({ sub: 'verified-apple-subject' }),
                        resolveEmail: jest.fn().mockReturnValue('review@example.com'),
                    },
                },
                { provide: AppleCredentialService, useValue: credentials },
                { provide: CustomLoggerService, useValue: { log: jest.fn() } },
            ],
        })
            .overrideInterceptor(AuthSocialCallbackResponseInterceptor)
            .useValue({})
            .compile();
        controller = module.get(AuthAppleLoginController);
    });

    it('영구삭제 등 로그인 거절 응답에서는 새 Apple 토큰을 수집하지 않는다', async () => {
        const rejected = { kind: 'error', frontendUrl: 'https://pawpong.kr', errorMessage: '계정 이용 불가' };
        flow.execute.mockResolvedValue(rejected);
        expect(await controller.appleCallback({ id_token: 'signed-id', code: 'one-time-code' })).toBe(rejected);
        expect(credentials.capture).not.toHaveBeenCalled();
    });

    it('인증 자격 증명 보관이 실패하면 성공 응답을 전달하지 않는다', async () => {
        flow.execute.mockResolvedValue({ kind: 'login_success', frontendUrl: 'https://pawpong.kr', tokens: {} });
        credentials.capture.mockRejectedValue(new Error('credential store unavailable'));
        await expect(controller.appleCallback({ id_token: 'signed-id', code: 'one-time-code' })).rejects.toThrow(
            'credential store unavailable',
        );
        expect(credentials.capture).toHaveBeenCalledWith('one-time-code', 'verified-apple-subject');
    });
});
