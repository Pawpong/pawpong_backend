import { EventEmitter } from 'events';
import { Request, Response } from 'express';
import { httpRequestLogging } from '../../logger/http-request-logging';
import { CustomLoggerService } from '../../logger/custom-logger.service';

it('correlates a completed request without logging secrets or supplied request IDs', () => {
    const logger = { log: jest.fn() };
    const response = Object.assign(new EventEmitter(), { locals: {}, setHeader: jest.fn(), statusCode: 401 });
    const request = {
        method: 'POST',
        url: '/api/auth?token=SECRET',
        body: { phone: 'PRIVATE' },
        headers: { 'x-request-id': 'INJECTED' },
    };
    const next = jest.fn();
    httpRequestLogging(logger as unknown as CustomLoggerService)(
        request as unknown as Request,
        response as unknown as Response,
        next,
    );
    response.emit('finish');
    expect(next).toHaveBeenCalledTimes(1);
    const record = JSON.parse(logger.log.mock.calls[0][0]);
    expect(record).toMatchObject({ path: '/api/auth', statusCode: 401, method: 'POST' });
    expect(record.requestId).toMatch(/^[a-f0-9-]{36}$/);
    expect(JSON.stringify(record)).not.toMatch(/SECRET|PRIVATE|INJECTED/);
    expect(response.setHeader).toHaveBeenCalledWith('X-Request-ID', record.requestId);
});
