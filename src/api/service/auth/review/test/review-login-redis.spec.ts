import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ReviewLoginLimitAdapter } from '../infrastructure/review-login-limit.adapter';

// 선택 실행: 기존 loopback Redis에 무작위 접두어의 테스트 키만 만들고 삭제한다.
const describeRedis = process.env.RUN_REVIEW_AUTH_REDIS_TESTS === 'true' ? describe : describe.skip;
describeRedis('review login shared Redis limits', () => {
    let adapter: ReviewLoginLimitAdapter;
    let inspect: Redis;
    const ownedKeys = new Set<string>();
    const nonce = () => randomBytes(16).toString('hex');
    const key = (kind: 'ip' | 'account', value: string) =>
        `auth:review:${kind}:${createHash('sha256')
            .update(
                value
                    .trim()
                    .toLowerCase()
                    .replace(/^::ffff:/, ''),
            )
            .digest('hex')}`;
    const allow = (ip: string, email: string) => {
        ownedKeys.add(key('ip', ip));
        ownedKeys.add(key('account', email));
        return adapter.allow(ip, email);
    };
    beforeAll(async () => {
        adapter = new ReviewLoginLimitAdapter({
            get: (name: string) => ({ REDIS_HOST: '127.0.0.1', REDIS_PORT: '6379' })[name],
        } as ConfigService);
        inspect = new Redis({ host: '127.0.0.1', port: 6379, maxRetriesPerRequest: 0, connectTimeout: 1000 });
        await inspect.ping();
    });
    afterAll(async () => {
        if (ownedKeys.size) await inspect.del(...ownedKeys);
        inspect.disconnect();
        adapter.onModuleDestroy();
    });

    it('atomically permits only 20 of 30 distributed-IP attempts against one normalized account', async () => {
        const email = `synthetic-${nonce()}@example.test`;
        const attempts = await Promise.all(
            Array.from({ length: 30 }, (_, index) =>
                allow(`synthetic-${nonce()}`, index % 2 ? ` ${email.toUpperCase()} ` : email),
            ),
        );
        expect(attempts.filter(Boolean)).toHaveLength(20);
        expect(await inspect.ttl(key('account', email))).toBeGreaterThan(880);
        expect(await inspect.ttl(key('account', email))).toBeLessThanOrEqual(900);
        await inspect.pexpire(key('account', email), 1);
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(await allow(`synthetic-${nonce()}`, email)).toBe(true);
    });

    it('limits one shared IP across different accounts to 60 attempts', async () => {
        const ip = `synthetic-${nonce()}`;
        const attempts = await Promise.all(
            Array.from({ length: 65 }, () => allow(ip, `synthetic-${nonce()}@example.test`)),
        );
        expect(attempts.filter(Boolean)).toHaveLength(60);
        expect(await inspect.ttl(key('ip', ip))).toBeGreaterThan(880);
        expect(await inspect.get(key('ip', ip))).toBe('65');
    });
});
