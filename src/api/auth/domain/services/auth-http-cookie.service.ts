import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';

import {
    AuthSocialCallbackPort,
    type AuthSocialCookieDefinition,
} from '../../application/ports/auth-social-callback.port';

@Injectable()
export class AuthHttpCookieService {
    constructor(
        @Inject(AuthSocialCallbackPort)
        private readonly authSocialCallbackPort: AuthSocialCallbackPort,
    ) {}

    clearAuthCookies(res: Response): void {
        const { cookieOptions } = this.authSocialCallbackPort.resolveCookieOptions();
        const expiredCookieOptions = {
            ...cookieOptions,
            maxAge: 0,
        };

        res.cookie('accessToken', '', expiredCookieOptions);
        res.cookie('refreshToken', '', expiredCookieOptions);
        res.cookie('userRole', '', { ...expiredCookieOptions, httpOnly: false });
    }

    applyCookies(res: Response, cookies?: AuthSocialCookieDefinition[]): void {
        if (!cookies) {
            return;
        }

        cookies.forEach((cookie) => {
            res.cookie(cookie.name, cookie.value, cookie.options);
        });
    }
}
