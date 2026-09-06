import type {
    AuthSocialCallbackProfile,
    AuthSocialCallbackRole,
    AuthSocialCallbackTokens,
    AuthSocialCookieOptions,
} from '../ports/auth-social-callback.port';

export type AuthSocialSignupFlowResult = {
    kind: 'signup';
    frontendUrl: string;
    userProfile: AuthSocialCallbackProfile;
    tempUserId: string;
};

export type AuthSocialLoginSuccessFlowResult = {
    kind: 'login_success';
    frontendUrl: string;
    originUrl?: string;
    role: AuthSocialCallbackRole;
    tokens: AuthSocialCallbackTokens;
    isProduction: boolean;
    cookieOptions: AuthSocialCookieOptions;
};

export type AuthSocialReactivationFlowResult = {
    kind: 'reactivation';
    frontendUrl: string;
    originUrl?: string;
    reactivationToken: string;
    expiresIn: number;
    role: AuthSocialCallbackRole;
    email: string;
    name: string;
    deletedAt?: string;
};

export type AuthSocialErrorFlowResult = {
    kind: 'error';
    frontendUrl: string;
    errorMessage: string;
};

export type AuthSocialCallbackFlowResult =
    | AuthSocialSignupFlowResult
    | AuthSocialLoginSuccessFlowResult
    | AuthSocialReactivationFlowResult
    | AuthSocialErrorFlowResult;
