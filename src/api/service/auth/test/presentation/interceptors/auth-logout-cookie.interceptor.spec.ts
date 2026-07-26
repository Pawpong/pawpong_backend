import type { CallHandler, ExecutionContext } from '@nestjs/common';
import type { Response } from 'express';
import { lastValueFrom, of } from 'rxjs';

import { AuthLogoutCookieInterceptor } from '../../../presentation/interceptors/auth-logout-cookie.interceptor';
import { AuthHttpCookieService } from '../../../presentation/services/auth-http-cookie.service';

describe('인증 로그아웃 쿠키 인터셉터', () => {
    const createExecutionContext = (response: Response): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        }) as unknown as ExecutionContext;

    it('성공 응답 뒤에 인증 쿠키를 비운다', async () => {
        const response = {} as Response;
        const authHttpCookieService = {
            clearAuthCookies: jest.fn(),
        } as unknown as AuthHttpCookieService;
        const interceptor = new AuthLogoutCookieInterceptor(authHttpCookieService);
        const next: CallHandler = {
            handle: () => of({ ok: true }),
        };

        const result = await lastValueFrom(interceptor.intercept(createExecutionContext(response), next));

        expect(authHttpCookieService.clearAuthCookies).toHaveBeenCalledWith(response);
        expect(result).toEqual({ ok: true });
    });
});
