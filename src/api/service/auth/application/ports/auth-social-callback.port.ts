export type AuthSocialCallbackRole = 'adopter' | 'breeder';

export type AuthSocialCallbackProfile = {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    profileImage?: string;
    originUrl?: string;
    needsEmail?: boolean;
};

export type AuthSocialAuthenticatedUser = {
    userId: string;
    email: string;
    name: string;
    role: AuthSocialCallbackRole;
    profileImage?: string;
};

export type AuthSocialCallbackLoginResult = {
    needsAdditionalInfo: boolean;
    tempUserId?: string;
    user?: AuthSocialAuthenticatedUser;
};

export type AuthSocialCallbackTokens = {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
    userInfo: {
        userId: string;
        email: string;
        name: string;
        profileImage?: string;
    };
};

export type AuthSocialCookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'none' | 'lax';
    domain?: string;
    path: string;
};

export type AuthSocialCookieDefinition = {
    name: string;
    value: string;
    options: AuthSocialCookieOptions & {
        maxAge: number;
        httpOnly?: boolean;
    };
};

export type AuthSocialCallbackResult = {
    redirectUrl: string;
    cookies?: AuthSocialCookieDefinition[];
};

export const AUTH_SOCIAL_CALLBACK_PORT = Symbol('AUTH_SOCIAL_CALLBACK_PORT');

export interface AuthSocialCallbackPort {
    resolveFrontendUrl(referer?: string, origin?: string): string;
    resolveCookieOptions(): {
        isProduction: boolean;
        cookieOptions: AuthSocialCookieOptions;
    };
    handleSocialLogin(profile: AuthSocialCallbackProfile): Promise<AuthSocialCallbackLoginResult>;
    generateSocialLoginTokens(user: AuthSocialAuthenticatedUser): Promise<AuthSocialCallbackTokens>;
}
