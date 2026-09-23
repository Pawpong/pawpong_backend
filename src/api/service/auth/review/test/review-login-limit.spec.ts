import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { ReviewLoginLimitAdapter } from '../infrastructure/review-login-limit.adapter';

describe('review login limiter fails closed', () => {
    it('never falls back to an in-process allowance when shared Redis is unavailable', async () => {
        const adapter = new ReviewLoginLimitAdapter({
            get: (key: string) => ({ REDIS_HOST: '127.0.0.1', REDIS_PORT: '1' })[key],
        } as ConfigService);
        try {
            await expect(adapter.allow('127.0.0.1', 'synthetic@example.test')).rejects.toBeInstanceOf(
                ServiceUnavailableException,
            );
            await expect(adapter.allow('127.0.0.1', 'synthetic@example.test')).rejects.toBeInstanceOf(
                ServiceUnavailableException,
            );
        } finally {
            adapter.onModuleDestroy();
        }
    });
});
