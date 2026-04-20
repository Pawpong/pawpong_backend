import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';

import {
    AUTH_SOCIAL_CALLBACK_PORT,
    type AuthSocialCallbackPort,
    type AuthSocialCookieDefinition,
} from '../../application/ports/auth-social-callback.port';

@Injectable()
export class AuthHttpCookieService {
    constructor(
        @Inject(AUTH_SOCIAL_CALLBACK_PORT)
        private readonly authSocialCallbackPort: AuthSocialCallbackPort,
    ) {}

    clearAuthCookies(response: Response): void {
        const { cookieOptions } = this.authSocialCallbackPort.resolveCookieOptions();
        const expiredCookieOptions = {
            ...cookieOptions,
            maxAge: 0,
        };

        response.cookie('accessToken', '', expiredCookieOptions);
        response.cookie('refreshToken', '', expiredCookieOptions);
        response.cookie('userRole', '', { ...expiredCookieOptions, httpOnly: false });
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
