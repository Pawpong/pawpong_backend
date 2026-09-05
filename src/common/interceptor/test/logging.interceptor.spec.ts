import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

import { LoggingInterceptor } from '../logging.interceptor';
import { CustomLoggerService } from '../../logger/custom-logger.service';

describe('LoggingInterceptor', () => {
    it('고객지원 문의 원문은 로그에 남기지 않는다', () => {
        const log = jest.fn();
        const interceptor = new LoggingInterceptor({ log } as unknown as CustomLoggerService);
        interceptor.intercept(
            createContext({
                method: 'POST',
                url: '/api/v2/home/support/inquiry?source=faq',
                ip: '127.0.0.1',
                headers: {},
                cookies: {},
                body: { question: 'private inquiry', userType: 'adopter' },
            }),
            { handle: () => of(null) },
        );
        const output = JSON.stringify(log.mock.calls);
        expect(output).toContain('[REDACTED]');
        expect(output).not.toContain('private inquiry');
    });
    const accessToken = 'eyJhbGciOiJIUzI1NiJ9.sensitive-payload.signature';

    function createContext(request: Record<string, unknown>): ExecutionContext {
        return {
            getType: () => 'http',
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        } as unknown as ExecutionContext;
    }

    it('Bearer 토큰 원문을 로그에 남기지 않는다', () => {
        const logger = { log: jest.fn() } as unknown as CustomLoggerService;
        const interceptor = new LoggingInterceptor(logger);
        const next = { handle: jest.fn(() => of({ ok: true })) } as unknown as CallHandler;

        interceptor.intercept(
            createContext({
                method: 'GET',
                url: '/api/v2/notification',
                ip: '127.0.0.1',
                headers: { authorization: `Bearer ${accessToken}` },
                cookies: { userRole: 'adopter' },
                body: {},
            }),
            next,
        );

        const output = (logger.log as jest.Mock).mock.calls.map(([message]) => message).join('\n');
        expect(output).toContain('Token: [REDACTED]');
        expect(output).not.toContain(accessToken);
        expect(next.handle).toHaveBeenCalledTimes(1);
    });
});
