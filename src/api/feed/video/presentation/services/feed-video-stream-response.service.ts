import { BadRequestException, Injectable } from '@nestjs/common';
import type { Response } from 'express';

import type { FeedVideoProxyResponse } from '../../application/use-cases/proxy-hls-file.use-case';

@Injectable()
export class FeedVideoStreamResponseService {
    async sendProxyResponse(
        response: Response,
        execute: () => Promise<FeedVideoProxyResponse>,
    ): Promise<void> {
        this.applyCorsHeaders(response);

        try {
            const proxyResponse = await execute();

            response.setHeader('Content-Type', proxyResponse.contentType);
            response.setHeader('X-Cache', proxyResponse.cacheStatus);
            response.setHeader('Cache-Control', proxyResponse.cacheControl);
            response.send(proxyResponse.body);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('파일을 가져올 수 없습니다.');
        }
    }

    private applyCorsHeaders(response: Response): void {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
}
