import { BadRequestException, Injectable } from '@nestjs/common';
import type { Response } from 'express';

import type { FeedVideoProxyResponse } from '../application/use-cases/proxy-hls-file.use-case';

@Injectable()
export class FeedVideoStreamResponseService {
    async sendProxyResponse(
        res: Response,
        execute: () => Promise<FeedVideoProxyResponse>,
    ): Promise<void> {
        this.applyCorsHeaders(res);

        try {
            const proxyResponse = await execute();

            res.setHeader('Content-Type', proxyResponse.contentType);
            res.setHeader('X-Cache', proxyResponse.cacheStatus);
            res.setHeader('Cache-Control', proxyResponse.cacheControl);
            res.send(proxyResponse.body);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('파일을 가져올 수 없습니다.');
        }
    }

    private applyCorsHeaders(res: Response): void {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
}
