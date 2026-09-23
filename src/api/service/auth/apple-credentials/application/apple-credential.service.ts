import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthAppleIdTokenService } from '../../domain/services/auth-apple-id-token.service';
import { AppleTokenCipherService } from '../domain/apple-token-cipher.service';
import { AppleTokenClientService } from '../infrastructure/apple-token-client.service';
import { APPLE_CREDENTIAL_PORT, type AppleCredentialPort } from './apple-credential.port';

export type AppleRevocationStatus = 'revoked' | 'not_applicable' | 'manual_disconnect_required';

@Injectable()
export class AppleCredentialService {
    constructor(
        @Inject(APPLE_CREDENTIAL_PORT) private readonly store: AppleCredentialPort,
        private readonly cipher: AppleTokenCipherService,
        private readonly client: AppleTokenClientService,
        private readonly idTokens: AuthAppleIdTokenService,
    ) {}

    /** 콜백 신원과 code 교환 결과의 신원이 같을 때만 폐기 가능한 자격 증명을 보관한다. */
    async capture(code: string | undefined, expectedSubject: string): Promise<void> {
        if (!code) throw new UnauthorizedException('Apple 인증 코드가 없습니다. 다시 로그인해주세요.');
        // 네트워크 요청 전에 키 준비 상태를 확인해 일회용 code를 불필요하게 소비하지 않는다.
        const digest = this.cipher.digest(expectedSubject);
        const tokens = await this.client.exchange(code);
        const claims = await this.idTokens.verify(tokens.id_token);
        if (claims.sub !== expectedSubject) throw new UnauthorizedException('Apple 인증 정보가 일치하지 않습니다.');
        await this.store.save(digest, this.cipher.encrypt(tokens.refresh_token, digest));
    }

    /** 저장된 토큰이 없는 과거 계정도 자체 데이터 삭제는 진행한다(Apple TN3194). */
    async revoke(input: { provider?: string; providerUserId?: string }): Promise<{ status: AppleRevocationStatus }> {
        if (input.provider !== 'apple') return { status: 'not_applicable' };
        if (!input.providerUserId) return { status: 'manual_disconnect_required' };
        const digest = this.cipher.digest(input.providerUserId);
        const row = await this.store.lockForRevocation(digest);
        if (row.state === 'revoked') return { status: row.revocationStatus ?? 'manual_disconnect_required' };
        if (!row.encryptedRefreshToken) {
            await this.store.finishRevocation(digest, 'manual_disconnect_required');
            return { status: 'manual_disconnect_required' };
        }
        // 네트워크/저장 실패 시 토큰을 유지해 worker의 다음 시도에서 이어 처리한다.
        await this.client.revoke(this.cipher.decrypt(row.encryptedRefreshToken, digest));
        await this.store.finishRevocation(digest, 'revoked');
        return { status: 'revoked' };
    }
}
