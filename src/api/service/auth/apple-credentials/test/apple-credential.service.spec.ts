import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { AppleCredentialService } from '../application/apple-credential.service';
import { AppleTokenCipherService } from '../domain/apple-token-cipher.service';
import type { AppleCredentialPort } from '../application/apple-credential.port';
import { AppleTokenClientService } from '../infrastructure/apple-token-client.service';
import { AuthAppleIdTokenService } from '../../domain/services/auth-apple-id-token.service';

const makeStore = () => ({
    save: jest.fn<ReturnType<AppleCredentialPort['save']>, Parameters<AppleCredentialPort['save']>>(),
    lockForRevocation: jest.fn<
        ReturnType<AppleCredentialPort['lockForRevocation']>,
        Parameters<AppleCredentialPort['lockForRevocation']>
    >(),
    finishRevocation: jest.fn<
        ReturnType<AppleCredentialPort['finishRevocation']>,
        Parameters<AppleCredentialPort['finishRevocation']>
    >(),
});

describe('Apple 자격 증명 보관과 영구 삭제', () => {
    const subject = 'test-apple-subject';
    let cipher: AppleTokenCipherService;
    let store: ReturnType<typeof makeStore>;
    let client: { exchange: jest.Mock; revoke: jest.Mock };
    let verify: jest.Mock;
    let service: AppleCredentialService;

    beforeEach(() => {
        cipher = new AppleTokenCipherService(
            new ConfigService({ APPLE_TOKEN_ENCRYPTION_KEY: randomBytes(32).toString('hex') }),
        );
        store = makeStore();
        client = {
            exchange: jest
                .fn()
                .mockResolvedValue({ id_token: 'signed-id-token', refresh_token: 'apple-refresh-secret' }),
            revoke: jest.fn(),
        };
        verify = jest.fn().mockResolvedValue({ sub: subject });
        service = new AppleCredentialService(
            store,
            cipher,
            client as unknown as AppleTokenClientService,
            { verify } as unknown as AuthAppleIdTokenService,
        );
    });

    it('검증된 같은 신원의 refresh token만 암호화 저장한다', async () => {
        await service.capture('one-time-code', subject);
        const [digest, envelope] = store.save.mock.calls[0];
        expect(digest).not.toContain(subject);
        expect(envelope).not.toContain('apple-refresh-secret');
        expect(cipher.decrypt(envelope, digest)).toBe('apple-refresh-secret');
        expect(verify).toHaveBeenCalledWith('signed-id-token');
    });

    it('다른 계정의 code를 섞으면 저장하지 않는다', async () => {
        verify.mockResolvedValue({ sub: 'another-account' });
        await expect(service.capture('another-code', subject)).rejects.toThrow('일치하지');
        expect(store.save).not.toHaveBeenCalled();
    });

    it('code가 없으면 Apple API와 저장소를 호출하지 않는다', async () => {
        await expect(service.capture(undefined, subject)).rejects.toThrow('코드가 없습니다');
        expect(client.exchange).not.toHaveBeenCalled();
        expect(store.save).not.toHaveBeenCalled();
    });

    it('다른 사용자에게 암호문을 옮기거나 변조하면 복호화하지 않는다', () => {
        const digest = cipher.digest(subject);
        const envelope = cipher.encrypt('test-token', digest);
        expect(() => cipher.decrypt(envelope, cipher.digest('other'))).toThrow();
        const parts = envelope.split('.');
        parts[3] = Buffer.from('tampered').toString('base64url');
        expect(() => cipher.decrypt(parts.join('.'), digest)).toThrow();
    });

    it('폐기 전에 잠그고 외부 연결 해제 성공 뒤에만 저장 토큰을 지운다', async () => {
        const digest = cipher.digest(subject);
        store.lockForRevocation.mockResolvedValue({
            subjectDigest: digest,
            state: 'revoking',
            encryptedRefreshToken: cipher.encrypt('old-token', digest),
        });
        await expect(service.revoke({ provider: 'apple', providerUserId: subject })).resolves.toEqual({
            status: 'revoked',
        });
        expect(client.revoke).toHaveBeenCalledWith('old-token');
        expect(store.finishRevocation).toHaveBeenCalledWith(digest, 'revoked');
        expect(store.lockForRevocation.mock.invocationCallOrder[0]).toBeLessThan(
            client.revoke.mock.invocationCallOrder[0],
        );
    });

    it('Apple 네트워크 실패는 토큰을 보존해 작업을 재시도한다', async () => {
        const digest = cipher.digest(subject);
        store.lockForRevocation.mockResolvedValue({
            subjectDigest: digest,
            state: 'revoking',
            encryptedRefreshToken: cipher.encrypt('old-token', digest),
        });
        client.revoke.mockRejectedValue(new Error('network unavailable'));
        await expect(service.revoke({ provider: 'apple', providerUserId: subject })).rejects.toThrow('network');
        expect(store.finishRevocation).not.toHaveBeenCalled();
    });

    it('저장된 토큰이 없는 과거 계정은 수동 해제 안내와 함께 자체 삭제를 허용한다', async () => {
        store.lockForRevocation.mockResolvedValue({ subjectDigest: cipher.digest(subject), state: 'revoking' });
        await expect(service.revoke({ provider: 'apple', providerUserId: subject })).resolves.toEqual({
            status: 'manual_disconnect_required',
        });
        expect(client.revoke).not.toHaveBeenCalled();
    });

    it('재시도에서도 수동 해제 필요 상태를 완료로 바꾸지 않는다', async () => {
        store.lockForRevocation.mockResolvedValue({
            subjectDigest: cipher.digest(subject),
            state: 'revoked',
            revocationStatus: 'manual_disconnect_required',
        });
        await expect(service.revoke({ provider: 'apple', providerUserId: subject })).resolves.toEqual({
            status: 'manual_disconnect_required',
        });
        expect(client.revoke).not.toHaveBeenCalled();
    });

    it('다른 로그인 제공자 계정은 Apple 저장소에 접근하지 않는다', async () => {
        await expect(service.revoke({ provider: 'google', providerUserId: subject })).resolves.toEqual({
            status: 'not_applicable',
        });
        expect(store.lockForRevocation).not.toHaveBeenCalled();
    });

    it('암호화 키가 없으면 code를 소비하거나 평문을 저장하지 않는다', async () => {
        service = new AppleCredentialService(
            store,
            new AppleTokenCipherService(new ConfigService({})),
            client as unknown as AppleTokenClientService,
            { verify } as unknown as AuthAppleIdTokenService,
        );
        await expect(service.capture('one-time-code', subject)).rejects.toThrow('저장소');
        expect(client.exchange).not.toHaveBeenCalled();
        expect(store.save).not.toHaveBeenCalled();
    });
});
