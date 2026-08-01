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

export type AuthSocialErrorFlowResult = {
    kind: 'error';
    frontendUrl: string;
    errorMessage: string;
};

export type AuthSocialCallbackFlowResult =
    | AuthSocialSignupFlowResult
    | AuthSocialLoginSuccessFlowResult
    | AuthSocialErrorFlowResult;
