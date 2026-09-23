import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import { importPKCS8, SignJWT } from 'jose';

type AppleTokenResponse = { id_token: string; refresh_token: string };
const APPLE_ISSUER = 'https://appleid.apple.com';

@Injectable()
export class AppleTokenClientService {
    constructor(private readonly config: ConfigService) {}

    /** Apple 서명키 경로는 운영 설정만 사용하며 매 요청 짧게 유효한 client secret을 발급한다. */
    private async clientParameters(): Promise<Record<string, string>> {
        const clientId = this.config.get<string>('APPLE_CLIENT_ID');
        const teamId = this.config.get<string>('APPLE_TEAM_ID');
        const keyId = this.config.get<string>('APPLE_KEY_ID');
        const inlineKey = this.config.get<string>('APPLE_PRIVATE_KEY');
        const keyPath = this.config.get<string>('APPLE_PRIVATE_KEY_PATH');
        if (!clientId || !teamId || !keyId || (!inlineKey && !keyPath)) {
            throw new ServiceUnavailableException('Apple 인증 설정을 확인해주세요.');
        }
        const pem = inlineKey ? inlineKey.replace(/\\n/g, '\n') : await readFile(keyPath!, 'utf8');
        const privateKey = await importPKCS8(pem, 'ES256');
        const secret = await new SignJWT({})
            .setProtectedHeader({ alg: 'ES256', kid: keyId })
            .setIssuer(teamId)
            .setSubject(clientId)
            .setAudience(APPLE_ISSUER)
            .setIssuedAt()
            .setExpirationTime('5m')
            .sign(privateKey);
        return { client_id: clientId, client_secret: secret };
    }

    /** 일회용 code를 교환한다. 응답 본문·인증 코드는 오류 로그에 포함하지 않는다. */
    async exchange(code: string): Promise<AppleTokenResponse> {
        const redirectUri = this.config.get<string>('APPLE_CALLBACK_URL');
        if (!redirectUri) throw new ServiceUnavailableException('Apple 인증 설정을 확인해주세요.');
        const response = await fetch(`${APPLE_ISSUER}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                ...(await this.clientParameters()),
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
            signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new UnauthorizedException('Apple 인증 코드를 확인할 수 없습니다. 다시 로그인해주세요.');
        const data = (await response.json()) as Partial<AppleTokenResponse>;
        if (typeof data.id_token !== 'string' || typeof data.refresh_token !== 'string' || !data.refresh_token) {
            throw new UnauthorizedException('Apple 인증 응답이 올바르지 않습니다.');
        }
        return { id_token: data.id_token, refresh_token: data.refresh_token };
    }

    /** Apple은 이미 폐기된 토큰도 200을 반환하므로 네트워크 실패 뒤 안전하게 재시도할 수 있다. */
    async revoke(refreshToken: string): Promise<void> {
        const response = await fetch(`${APPLE_ISSUER}/auth/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                ...(await this.clientParameters()),
                token: refreshToken,
                token_type_hint: 'refresh_token',
            }),
            signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new ServiceUnavailableException('Apple 연결 해제를 다시 시도하고 있습니다.');
    }
}
