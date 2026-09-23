import { ConfigService } from '@nestjs/config';
import { exportPKCS8, generateKeyPair, jwtVerify } from 'jose';
import { AppleTokenClientService } from '../infrastructure/apple-token-client.service';

describe('Apple REST token client', () => {
    let client: AppleTokenClientService;
    let publicKey: Awaited<ReturnType<typeof generateKeyPair>>['publicKey'];
    let request: jest.SpyInstance;

    beforeAll(async () => {
        const pair = await generateKeyPair('ES256');
        publicKey = pair.publicKey;
        client = new AppleTokenClientService(
            new ConfigService({
                APPLE_CLIENT_ID: 'example.test.web',
                APPLE_TEAM_ID: 'TESTTEAM12',
                APPLE_KEY_ID: 'TESTKEY123',
                APPLE_PRIVATE_KEY: (await exportPKCS8(pair.privateKey)).replace(/\n/g, '\\n'),
                APPLE_CALLBACK_URL: 'https://example.test/api/auth/apple/callback',
            }),
        );
    });
    beforeEach(() => {
        request = jest.spyOn(globalThis, 'fetch');
    });
    afterEach(() => {
        request.mockRestore();
    });

    it('code 교환은 Apple 고정 endpoint와 동일 redirect URI 및 ES256 client secret을 쓴다', async () => {
        request.mockResolvedValue(
            new Response(JSON.stringify({ id_token: 'id-token', refresh_token: 'provider-refresh' })),
        );
        await client.exchange('single-use-code');
        const [url, options] = request.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://appleid.apple.com/auth/token');
        const body = options.body as URLSearchParams;
        expect(body.get('grant_type')).toBe('authorization_code');
        expect(body.get('redirect_uri')).toBe('https://example.test/api/auth/apple/callback');
        expect(body.get('code')).toBe('single-use-code');
        const { payload, protectedHeader } = await jwtVerify(body.get('client_secret')!, publicKey, {
            audience: 'https://appleid.apple.com',
            issuer: 'TESTTEAM12',
        });
        expect(protectedHeader).toEqual({ alg: 'ES256', kid: 'TESTKEY123' });
        expect(payload.sub).toBe('example.test.web');
        expect(payload.exp! - payload.iat!).toBe(300);
    });

    it('revoke는 Pawpong JWT가 아닌 저장된 Apple refresh token을 전달하며 빈 200을 허용한다', async () => {
        request.mockResolvedValue(new Response(null, { status: 200 }));
        await client.revoke('provider-refresh');
        const [url, options] = request.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://appleid.apple.com/auth/revoke');
        expect((options.body as URLSearchParams).get('token_type_hint')).toBe('refresh_token');
        expect((options.body as URLSearchParams).get('token')).toBe('provider-refresh');
    });

    it('교환 오류의 원본 응답을 노출하지 않는다', async () => {
        request.mockResolvedValue(new Response('sensitive-response-marker', { status: 400 }));
        try {
            await client.exchange('private-code');
            throw new Error('expected failure');
        } catch (error) {
            expect(String(error)).not.toMatch(/sensitive-response-marker|private-code/);
        }
    });

    it('revoke가 실패하면 완료로 간주하지 않는다', async () => {
        request.mockResolvedValue(new Response('error', { status: 503 }));
        await expect(client.revoke('provider-refresh')).rejects.toThrow('다시 시도');
    });
});
