import { createHash, randomBytes } from 'node:crypto';
import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AuthNativeSessionAdapter } from '../../infrastructure/auth-native-session.adapter';

// 기존 로컬 Redis에 고유 키만 만들며 flush/프로세스 시작은 하지 않는다.
const describeRedis = process.env.RUN_NATIVE_AUTH_REDIS_TESTS === 'true' ? describe : describe.skip;
describeRedis('native OAuth Redis atomicity (existing local Redis)', () => {
    let adapter: AuthNativeSessionAdapter;
    let inspect: Redis;
    const config = (port = '6379') =>
        ({ get: (key: string) => ({ REDIS_HOST: '127.0.0.1', REDIS_PORT: port })[key] }) as ConfigService;
    const nonce = () => randomBytes(32).toString('base64url');
    const session = { codeChallenge: 'test-challenge', frontendOrigin: 'https://pawpong.kr', returnUrl: '/chat' };
    const key = (kind: string, value: string) =>
        `auth:native-google:${kind}:${createHash('sha256').update(value).digest('hex')}`;
    const cleanup: string[] = [];

    beforeAll(async () => {
        adapter = new AuthNativeSessionAdapter(config());
        inspect = new Redis({ host: '127.0.0.1', port: 6379, maxRetriesPerRequest: 0, connectTimeout: 1000 });
        await inspect.ping();
    });
    afterAll(async () => {
        if (cleanup.length) await inspect.del(...cleanup);
        adapter.onModuleDestroy();
        inspect.disconnect();
    });

    it('state expires in 10 minutes and only one simultaneous callback can consume it', async () => {
        const state = nonce();
        cleanup.push(key('state', state));
        await adapter.saveSession(state, session);
        expect(await inspect.ttl(key('state', state))).toBeGreaterThan(590);
        expect(await inspect.ttl(key('state', state))).toBeLessThanOrEqual(600);
        const results = await Promise.all(Array.from({ length: 12 }, () => adapter.consumeSession(state)));
        expect(results.filter(Boolean)).toEqual([session]);
    });

    it('wrong PKCE/state cannot consume code; one of 12 concurrent exchanges succeeds', async () => {
        const code = nonce();
        const state = nonce();
        cleanup.push(key('handoff', code));
        const handoff = {
            state,
            codeChallenge: 'challenge',
            redirectUrl: 'https://pawpong.kr/login/success?accessToken=test-only',
        };
        await adapter.saveHandoff(code, handoff);
        expect(await inspect.ttl(key('handoff', code))).toBeGreaterThan(80);
        expect(await inspect.ttl(key('handoff', code))).toBeLessThanOrEqual(90);
        expect(await adapter.consumeHandoff(code, state, 'wrong')).toBeNull();
        expect(await adapter.consumeHandoff(code, 'wrong', 'challenge')).toBeNull();
        const results = await Promise.all(
            Array.from({ length: 12 }, () => adapter.consumeHandoff(code, state, 'challenge')),
        );
        expect(results.filter(Boolean)).toEqual([handoff]);
    });

    it('expired state and exchange code cannot be consumed', async () => {
        const state = nonce();
        const code = nonce();
        cleanup.push(key('state', state), key('handoff', code));
        await adapter.saveSession(state, session);
        await adapter.saveHandoff(code, {
            state,
            codeChallenge: 'challenge',
            redirectUrl: 'https://pawpong.kr/signup',
        });
        await inspect.pexpire(key('state', state), 1);
        await inspect.pexpire(key('handoff', code), 1);
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(await adapter.consumeSession(state)).toBeNull();
        expect(await adapter.consumeHandoff(code, state, 'challenge')).toBeNull();
    });

    it('shared IP limit accepts 30 starts, rejects the 31st and has a 10 minute TTL', async () => {
        const ip = `test-${nonce()}`.toLowerCase();
        cleanup.push(key('start-limit', ip));
        const results = await Promise.all(Array.from({ length: 31 }, () => adapter.allowStart(ip)));
        expect(results.filter(Boolean)).toHaveLength(30);
        expect(results.filter((value) => !value)).toHaveLength(1);
        expect(await inspect.ttl(key('start-limit', ip))).toBeGreaterThan(590);
    });

    it('an unavailable Redis never uses an in-process fallback', async () => {
        const unavailable = new AuthNativeSessionAdapter(config('1'));
        try {
            await expect(unavailable.saveSession(nonce(), session)).rejects.toBeInstanceOf(ServiceUnavailableException);
            await expect(unavailable.consumeSession(nonce())).rejects.toBeInstanceOf(ServiceUnavailableException);
            await expect(unavailable.allowStart('test')).rejects.toBeInstanceOf(ServiceUnavailableException);
        } finally {
            unavailable.onModuleDestroy();
        }
    });
});
