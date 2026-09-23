import { randomBytes, createHash } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthSocialRedirectPathService } from './auth-social-redirect-path.service';

export const NATIVE_GOOGLE_STATE_PREFIX = 'native_google_';
export const NATIVE_GOOGLE_STATE_PATTERN = /^native_google_[A-Za-z0-9_-]{43}$/;
export const NATIVE_AUTH_CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/;
export const NATIVE_AUTH_VERIFIER_PATTERN = /^[A-Za-z0-9._~-]{43,128}$/;
export const NATIVE_AUTH_CALLBACK = 'pawpong://auth/callback';

/** 브라우저에서 앱으로 넘어오는 인증 결과는 고정된 앱과 허용된 웹 출처에만 연결한다. */
@Injectable()
export class AuthNativeLoginPolicyService {
    constructor(
        private readonly config: ConfigService,
        private readonly redirectPath: AuthSocialRedirectPathService,
    ) {}

    /** 운영 인증은 운영 웹으로만 복귀하며 개발 출처는 개발 서버에서만 허용한다. */
    normalizeOrigin(value: string): string {
        const allowed = new Set(['https://pawpong.kr']);
        const environment = this.config.get<string>('APP_ENV');
        if (environment === 'development' || environment === 'dev' || environment === 'local') {
            allowed.add('https://dev.pawpong.kr');
        }
        if (environment === 'local') {
            for (const origin of ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://10.0.2.2:3000']) {
                allowed.add(origin);
            }
        }
        if (!allowed.has(value)) throw new BadRequestException('허용되지 않은 앱 로그인 출처입니다.');
        return value;
    }

    /** 외부 URL, 역슬래시, 제어 문자로 복귀 위치를 바꾸는 입력을 거부한다. */
    normalizeReturnUrl(value?: string): string {
        if (value === undefined) return '/explore';
        const path = this.redirectPath.normalize(value);
        const hasControlCharacter = Array.from(value).some((character) => {
            const code = character.charCodeAt(0);
            return code < 32 || code === 127;
        });
        if (!path || value.length > 2048 || value.includes('\\') || hasControlCharacter) {
            throw new BadRequestException('로그인 후 이동 경로가 올바르지 않습니다.');
        }
        return path;
    }

    /** 앱이 기억할 수 없는 추측 불가능한 state를 발급한다. */
    createState(): string {
        return `${NATIVE_GOOGLE_STATE_PREFIX}${this.createCode()}`;
    }

    /** 복귀 URL에는 세션 토큰 대신 짧게 유효한 일회용 코드만 실어 보낸다. */
    createCode(): string {
        return randomBytes(32).toString('base64url');
    }

    /** 교환 요청의 PKCE verifier를 RFC 7636 S256 방식으로 비교한다. */
    challengeFor(verifier: string): string {
        if (!NATIVE_AUTH_VERIFIER_PATTERN.test(verifier)) throw new BadRequestException('잘못된 인증 요청입니다.');
        return createHash('sha256').update(verifier).digest('base64url');
    }

    /** Google에 등록된 기존 HTTPS 콜백과 클라이언트를 그대로 사용한다. */
    authorizationUrl(state: string): string {
        const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
        const callbackUrl = this.config.get<string>('GOOGLE_CALLBACK_URL');
        if (!clientId || !callbackUrl) throw new BadRequestException('Google 로그인이 설정되지 않았습니다.');
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        url.search = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            response_type: 'code',
            scope: 'email profile',
            state,
        }).toString();
        return url.href;
    }

    /** 결과 코드와 state 외에 임의 URI나 토큰을 앱 스킴으로 전달하지 않는다. */
    callbackUrl(state: string, result: { code: string } | { error: 'cancelled' | 'authentication_failed' }): string {
        const query = new URLSearchParams({ ...result, state });
        return `${NATIVE_AUTH_CALLBACK}?${query.toString()}`;
    }

    /** 서버 내부 결과 조합 오류도 외부 출처에 토큰을 넘기지 않게 막는다. */
    validateRedirect(redirectUrl: string, origin: string): void {
        const url = new URL(redirectUrl);
        if (
            url.origin !== origin ||
            url.username ||
            url.password ||
            !['/login/success', '/signup', '/login'].includes(url.pathname)
        ) {
            throw new BadRequestException('로그인 결과 주소가 올바르지 않습니다.');
        }
    }
}
