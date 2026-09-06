import { Logger } from '@nestjs/common';
import { Request } from 'express';
import { logHttpFailure } from '../http-error-log';

describe('HTTP incident logging policy', () => {
    const request = { method: 'GET', url: '/api/auth/naver/callback?code=SECRET&state=PRIVATE' } as Request;
    it.each([400, 401, 403, 404, 409, 422])('keeps expected %s failures informational without secrets', (status) => {
        const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
        logHttpFailure(logger as unknown as Logger, request, status, 'PRIVATE STACK');
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        const output = logger.log.mock.calls[0][0];
        expect(output).not.toMatch(/SECRET|PRIVATE/);
        expect(JSON.parse(output).statusCode).toBe(status);
    });
    it('retains 5xx stack and separates rate limits', () => {
        const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
        logHttpFailure(logger as unknown as Logger, request, 500, 'failure stack');
        expect(logger.error).toHaveBeenCalledWith(expect.any(String), 'failure stack');
        logHttpFailure(logger as unknown as Logger, request, 429);
        expect(logger.warn).toHaveBeenCalledTimes(1);
    });
});
