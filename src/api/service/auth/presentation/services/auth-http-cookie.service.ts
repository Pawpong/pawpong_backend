import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';

import {
    AUTH_SOCIAL_CALLBACK_PORT,
    type AuthSocialCallbackPort,
    type AuthSocialCookieDefinition,
} from '../../application/ports/auth-social-callback.port';
import { AUTH_COOKIE_NAMES, buildExpiredAuthCookieOptions } from '../../constants/auth-cookie.constants';

@Injectable()
export class AuthHttpCookieService {
    constructor(
        @Inject(AUTH_SOCIAL_CALLBACK_PORT)
        private readonly authSocialCallbackPort: AuthSocialCallbackPort,
    ) {}

    /**
     * 인증 쿠키 만료. httpOnly 는 AUTH_COOKIE_POLICIES 를 따라 로그인 때와 같은 값을 쓴다 —
     * 공통 옵션(httpOnly: true)을 그대로 쓰면 accessToken 이 HttpOnly 로 덮여 로그아웃이 무력해진다.
     */
    clearAuthCookies(response: Response): void {
        const { cookieOptions } = this.authSocialCallbackPort.resolveCookieOptions();

        AUTH_COOKIE_NAMES.forEach((name) => {
            response.cookie(name, '', buildExpiredAuthCookieOptions(name, cookieOptions));
        });
    }

    applyCookies(response: Response, cookies?: AuthSocialCookieDefinition[]): void {
        if (!cookies) {
            return;
        }

        cookies.forEach((cookie) => {
            response.cookie(cookie.name, cookie.value, cookie.options);
        });
    }
}
