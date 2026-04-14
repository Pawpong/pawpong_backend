import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { FeedVideoProxyResponse } from '../../application/use-cases/proxy-hls-file.use-case';

@Injectable()
export class FeedVideoStreamResponseInterceptor implements NestInterceptor<FeedVideoProxyResponse, Buffer | string> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<FeedVideoProxyResponse>,
    ): Observable<Buffer | string> {
        const response = context.switchToHttp().getResponse<Response>();
        this.applyCorsHeaders(response);

        return next.handle().pipe(
            map((proxyResponse) => {
                response.setHeader('Content-Type', proxyResponse.contentType);
                response.setHeader('X-Cache', proxyResponse.cacheStatus);
                response.setHeader('Cache-Control', proxyResponse.cacheControl);
                return proxyResponse.body;
            }),
        );
    }

    private applyCorsHeaders(response: Response): void {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
}
