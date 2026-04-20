import type { AuthSocialCallbackProfile } from './auth-social-callback.port';
import type { AuthSocialCallbackFlowResult } from '../types/auth-social-callback-flow.type';

export interface GetSocialLoginRedirectUrlQueryPort {
    execute(provider: 'google' | 'naver' | 'kakao', referer?: string, origin?: string, returnUrl?: string): string;
}

export interface ProcessSocialLoginCallbackFlowPort {
    execute(userProfile: AuthSocialCallbackProfile, referer?: string, origin?: string): Promise<AuthSocialCallbackFlowResult>;
}
