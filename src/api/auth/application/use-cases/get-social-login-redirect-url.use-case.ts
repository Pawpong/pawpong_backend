import { Injectable, Logger } from '@nestjs/common';

type SocialLoginProvider = 'google' | 'naver' | 'kakao';

@Injectable()
export class GetSocialLoginRedirectUrlUseCase {
    private readonly logger = new Logger(GetSocialLoginRedirectUrlUseCase.name);

    execute(provider: SocialLoginProvider, referer?: string, origin?: string, returnUrl?: string): string {
        const originUrl = referer || origin || '';
        const stateValue = returnUrl ? `${originUrl}|${returnUrl}` : originUrl;
        const encodedState = encodeURIComponent(stateValue);

        this.logger.log(`[${provider}Login] referer: ${referer || ''}`);
        this.logger.log(`[${provider}Login] origin: ${origin || ''}`);
        this.logger.log(`[${provider}Login] originUrl: ${originUrl}`);

        switch (provider) {
            case 'google':
                return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || '')}&response_type=code&scope=email%20profile&state=${encodedState}`;
            case 'naver':
                return `https://nid.naver.com/oauth2.0/authorize?client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NAVER_CALLBACK_URL || '')}&response_type=code&state=${encodedState}`;
            case 'kakao':
                return `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.KAKAO_CALLBACK_URL || '')}&response_type=code&state=${encodedState}`;
        }
    }
}
