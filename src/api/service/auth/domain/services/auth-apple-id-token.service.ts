import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import type { AppleIdTokenClaims } from '../../../../../common/types/social-oauth.type';

const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_JWKS_URL = new URL('https://appleid.apple.com/auth/keys');

/**
 * Apple id_token 검증.
 *
 * Apple 로그인은 다른 소셜과 달리 **서명된 JWT 자체가 신원 증명**이다.
 * 검증 없이 payload 를 디코딩해 쓰면 누구나 sub 를 위조해 남의 계정으로 로그인할 수 있으므로,
 * Apple 공개키(JWKS)로 서명·발급자·수신자·만료를 모두 확인한 뒤에만 신뢰한다.
 *
 * JWKS 는 jose 가 캐시하고 키 회전 시 자동으로 다시 받아온다.
 */
@Injectable()
export class AuthAppleIdTokenService {
    private readonly jwks = createRemoteJWKSet(APPLE_JWKS_URL);

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * id_token 을 검증하고 신뢰할 수 있는 클레임을 돌려준다.
     * 검증 실패는 전부 401 로 수렴시킨다 — 실패 사유를 호출자에게 구분해 줄 이유가 없다.
     */
    async verify(idToken: string): Promise<AppleIdTokenClaims> {
        if (!idToken) {
            throw new UnauthorizedException('Apple 인증 토큰이 없습니다.');
        }

        // audience 는 웹 로그인의 Services ID. 네이티브 로그인을 붙이면 앱 번들 ID 도 함께 허용해야 한다.
        const audience = [this.configService.get<string>('APPLE_CLIENT_ID') || ''].filter(Boolean);
        if (audience.length === 0) {
            throw new UnauthorizedException('Apple 로그인이 설정되지 않았습니다.');
        }

        try {
            const { payload } = await jwtVerify(idToken, this.jwks, {
                issuer: APPLE_ISSUER,
                audience,
            });

            const claims = payload as unknown as AppleIdTokenClaims;
            if (!claims.sub) {
                throw new UnauthorizedException('Apple 인증 정보가 올바르지 않습니다.');
            }

            return claims;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            this.logger.logError('appleLogin', 'Apple id_token 검증 실패', error);
            throw new UnauthorizedException('Apple 인증에 실패했습니다.');
        }
    }

    /**
     * Apple 은 이메일을 최초 1회만 주고, 사용자가 가리기를 택하면 릴레이 주소가 온다.
     * 둘 다 없을 때를 대비해 sub 기반 대체 주소를 만든다 — 다른 소셜 전략과 같은 정책이다.
     */
    resolveEmail(claims: AppleIdTokenClaims, formEmail?: string): string {
        return claims.email || formEmail || `apple_${claims.sub}@temp.pawpong.com`;
    }
}
