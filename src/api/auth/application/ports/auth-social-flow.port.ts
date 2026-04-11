import type { AuthSocialCallbackProfile, AuthSocialCallbackResult } from './auth-social-callback.port';

export interface GetSocialLoginRedirectUrlQueryPort {
    execute(provider: 'google' | 'naver' | 'kakao', referer?: string, origin?: string, returnUrl?: string): string;
}

export interface ProcessSocialLoginCallbackFlowPort {
    execute(userProfile: AuthSocialCallbackProfile, referer?: string, origin?: string): Promise<AuthSocialCallbackResult>;
}
