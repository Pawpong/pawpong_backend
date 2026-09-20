import { Injectable, Logger } from '@nestjs/common';

import { AuthSocialRedirectPathService } from '../../domain/services/auth-social-redirect-path.service';

type SocialLoginProvider = 'google' | 'naver' | 'kakao' | 'apple';

@Injectable()
export class GetSocialLoginRedirectUrlUseCase {
    private readonly logger = new Logger(GetSocialLoginRedirectUrlUseCase.name);

    constructor(private readonly authSocialRedirectPathService: AuthSocialRedirectPathService) {}

    execute(provider: SocialLoginProvider, referer?: string, origin?: string, returnUrl?: string): string {
        const originUrl = referer || origin || '';
        const safeReturnUrl = this.authSocialRedirectPathService.normalize(returnUrl);
        const stateValue = safeReturnUrl ? `${originUrl}|${safeReturnUrl}` : originUrl;
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
            case 'apple':
                // Apple 은 name/email scope 를 요청하면 response_mode=form_post 가 **필수**다.
                // 그래서 콜백이 다른 제공사와 달리 POST 로 들어온다.
                // response_type 에 id_token 을 포함시켜 콜백에서 바로 신원을 검증한다(토큰 교환 불필요).
                return `https://appleid.apple.com/auth/authorize?client_id=${process.env.APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.APPLE_CALLBACK_URL || '')}&response_type=${encodeURIComponent('code id_token')}&scope=${encodeURIComponent('name email')}&response_mode=form_post&state=${encodedState}`;
        }
    }
}
