import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';

import {
    type AuthSocialCallbackResult,
    type AuthSocialCallbackTokens,
} from '../../application/ports/auth-social-callback.port';
import { AuthSocialRedirectPathService } from '../../domain/services/auth-social-redirect-path.service';

type LoginSuccessInput = {
    frontendUrl: string;
    originUrl?: string;
    tokens: AuthSocialCallbackTokens;
};

/**
 * 소셜 로그인 성공을 프론트엔드 복귀 URL 로 변환한다.
 *
 * **모든 환경에서 토큰을 URL 파라미터로 넘기고 Set-Cookie 는 굽지 않는다.**
 * 쿠키 소유권은 프론트 BFF(`/api/auth/set-cookie`) 한 곳에 둔다. 과거에는 운영에서만
 * 백엔드가 `Domain=.pawpong.kr` 쿠키를 굽고 `/login/success` 를 건너뛰었는데, 그 때문에
 *
 * - 토큰 갱신 시 BFF 가 심는 host-only 쿠키와 겹쳐 같은 이름 쿠키가 두 벌이 되고
 *   (양쪽 모두 첫 항목만 읽어 옛 토큰을 집는다 — 프론트는 getAccessToken(), 백엔드는 cookie-parser)
 * - RN 웹뷰가 `/login/success` 에서만 accessToken 을 postMessage 로 받기 때문에
 *   운영 앱 사용자의 푸시 토큰 등록이 아예 일어나지 않았다
 *
 * dev 도메인에는 2026-05 에 같은 조치가 들어갔고, 이 변경은 운영에 누락됐던 분을 맞추는 것이다.
 */
@Injectable()
export class AuthSocialLoginSuccessRedirectFactoryService {
    constructor(
        private readonly authSocialRedirectPathService: AuthSocialRedirectPathService,
        private readonly logger: CustomLoggerService,
    ) {}

    create(input: LoginSuccessInput): AuthSocialCallbackResult {
        this.logger.log(`[processSocialLoginCallback] URL 파라미터 방식으로 토큰 전달: ${input.frontendUrl}`);

        const redirectPath = this.authSocialRedirectPathService.resolve(input.originUrl, this.logger, true);

        return {
            redirectUrl: `${input.frontendUrl}/login/success?accessToken=${encodeURIComponent(input.tokens.accessToken)}&refreshToken=${encodeURIComponent(input.tokens.refreshToken)}&returnUrl=${encodeURIComponent(redirectPath)}`,
        };
    }
}
