import type { CallHandler, ExecutionContext } from '@nestjs/common';
import type { Response } from 'express';
import { of, lastValueFrom } from 'rxjs';

import type { AuthSocialCallbackFlowResult } from '../../../application/types/auth-social-callback-flow.type';
import { AuthSocialCallbackResponseInterceptor } from '../../../presentation/interceptors/auth-social-callback-response.interceptor';
import { AuthSocialCallbackResultFactoryService } from '../../../presentation/services/auth-social-callback-result-factory.service';

describe('인증 소셜 콜백 응답 인터셉터', () => {
    const createExecutionContext = (response: Response): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        }) as unknown as ExecutionContext;

    it('콜백 결과를 리다이렉트 응답으로 변환한다', async () => {
        const response = {
            redirect: jest.fn(),
            cookie: jest.fn(),
        } as unknown as Response;
        const authSocialCallbackResultFactoryService = {
            create: jest.fn().mockReturnValue({
                redirectUrl: 'https://pawpong.kr/login/success?accessToken=token',
            }),
        } as unknown as AuthSocialCallbackResultFactoryService;
        const interceptor = new AuthSocialCallbackResponseInterceptor(authSocialCallbackResultFactoryService);
        const result: AuthSocialCallbackFlowResult = {
            kind: 'error',
            frontendUrl: 'https://pawpong.kr',
            errorMessage: '로그인 실패',
        };
        const next: CallHandler<AuthSocialCallbackFlowResult> = {
            handle: () => of(result),
        };

        await lastValueFrom(interceptor.intercept(createExecutionContext(response), next));

        expect(authSocialCallbackResultFactoryService.create).toHaveBeenCalledWith(result);
        expect(response.redirect).toHaveBeenCalledWith('https://pawpong.kr/login/success?accessToken=token');
        // 소셜 콜백은 더 이상 쿠키를 굽지 않는다 (쿠키 소유권은 프론트 BFF)
        expect(response.cookie).not.toHaveBeenCalled();
    });
});
