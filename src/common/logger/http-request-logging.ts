import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from './custom-logger.service';

export function httpRequestLogging(logger: CustomLoggerService) {
    return (request: Request, response: Response, next: NextFunction): void => {
        const requestId = randomUUID();
        response.locals.requestId = requestId;
        response.setHeader('X-Request-ID', requestId);
        const started = performance.now();
        response.once('finish', () => {
            const path = (request.originalUrl ?? request.url).split('?')[0];
            if (path.startsWith('/api/health') && response.statusCode < 400) return;
            // Deliberately exclude request/response bodies, cookies and query parameters.
            logger.log(
                JSON.stringify({
                    event: 'http_request',
                    requestId,
                    method: request.method,
                    path,
                    statusCode: response.statusCode,
                    durationMs: Math.round(performance.now() - started),
                }),
                'HTTP',
            );
        });
        next();
    };
}
