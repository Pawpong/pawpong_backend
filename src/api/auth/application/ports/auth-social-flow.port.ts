import type { AuthSocialCallbackProfile, AuthSocialCallbackResult } from './auth-social-callback.port';

export const GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY = Symbol('GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY');
export const PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW = Symbol('PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW');

export interface GetSocialLoginRedirectUrlQueryPort {
    execute(provider: 'google' | 'naver' | 'kakao', referer?: string, origin?: string, returnUrl?: string): string;
}

export interface ProcessSocialLoginCallbackFlowPort {
    execute(userProfile: AuthSocialCallbackProfile, referer?: string, origin?: string): Promise<AuthSocialCallbackResult>;
}
