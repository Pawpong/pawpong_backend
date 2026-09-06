import { Logger } from '@nestjs/common';
import { Request } from 'express';

/** Expected client failures are not server incidents. Never log OAuth query strings or request bodies. */
export function logHttpFailure(logger: Logger, request: Request, status: number, stack?: string): void {
    const path = (request.originalUrl ?? request.url ?? '/').split('?')[0].replace(/[\r\n]/g, '');
    const event = JSON.stringify({
        event: 'http_failure',
        requestId: request.res?.locals?.requestId,
        method: request.method,
        path,
        statusCode: status,
    });
    if (status >= 500) logger.error(event, stack);
    else if (status === 429) logger.warn(event);
    else logger.log(event);
}
