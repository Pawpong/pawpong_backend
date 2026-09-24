/* eslint @typescript-eslint/unbound-method: "off" -- Jest mock 호출 이력 matcher에 메서드 참조를 전달함. */
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

import { LoggingInterceptor } from '../logging.interceptor';
import { CustomLoggerService } from '../../logger/custom-logger.service';

describe('LoggingInterceptor', () => {
    it.each([
        {
            method: 'POST',
            url: '/api/auth/apple/callback?code=secret-query',
            body: {
                code: 'secret-code',
                id_token: 'secret-id-token',
                refresh_token: 'secret-refresh',
                receiptToken: 'secret-receipt',
            },
        },
        {
            method: 'POST',
            url: '/api/v2/auth/apple/receipt',
            body: {
                code: 'secret-code',
                id_token: 'secret-id-token',
                refresh_token: 'secret-refresh',
                receiptToken: 'secret-receipt',
            },
        },
        {
            method: 'POST',
            url: '/api/auth/review-login?password=secret-query',
            body: {
                emailAddress: 'secret-email@example.com',
                password: 'secret-password',
                nested: { password: 'secret-nested' },
            },
        },
        {
            method: 'POST',
            url: '/api/v2/auth/native/exchange?debug=secret-query',
            body: { code: 'secret-code', state: 'secret-state', codeVerifier: 'secret-verifier' },
        },
        {
            method: 'POST',
            url: '/api/v2/auth/native/google/start',
            body: { codeChallenge: 'secret-challenge', frontendOrigin: 'https://pawpong.kr' },
        },
        { method: 'GET', url: '/api/auth/google/callback?code=secret-code&state=secret-state', body: {} },
    ])('네이티브 OAuth 비밀값을 로그에 남기지 않는다: $url', ({ method, url, body }) => {
        const log = jest.fn();
        const interceptor = new LoggingInterceptor({ log } as unknown as CustomLoggerService);
        interceptor.intercept(createContext({ method, url, body, ip: '127.0.0.1', headers: {} }), {
            handle: () => of(null),
        });
        expect(JSON.stringify(log.mock.calls)).not.toContain('secret-');
    });
    it.each(['inquiry', 'feedback'])('고객지원 %s 원문은 로그에 남기지 않는다', (route) => {
        const log = jest.fn();
        const interceptor = new LoggingInterceptor({ log } as unknown as CustomLoggerService);
        interceptor.intercept(
            createContext({
                method: 'POST',
                url: '/api/v2/home/support/' + route + '?source=faq',
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

        const output = (logger.log as jest.Mock).mock.calls.map(([message]: [unknown]) => String(message)).join('\n');
        expect(output).toContain('Token: [REDACTED]');
        expect(output).not.toContain(accessToken);
        expect(next.handle).toHaveBeenCalledTimes(1);
    });
});
