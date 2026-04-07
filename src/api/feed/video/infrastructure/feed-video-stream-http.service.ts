import { BadRequestException, Injectable } from '@nestjs/common';
import type { Response } from 'express';

import { SegmentPrefetchResponseDto } from '../dto/response/video-response.dto';
import { ProxyHlsFileUseCase } from '../application/use-cases/proxy-hls-file.use-case';

@Injectable()
export class FeedVideoStreamHttpService {
    constructor(private readonly proxyHlsFileUseCase: ProxyHlsFileUseCase) {}

    async stream(videoId: string, filename: string, res: Response): Promise<void> {
        this.applyCorsHeaders(res);

        try {
            const proxyResponse = await this.proxyHlsFileUseCase.execute(videoId, filename);

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

    buildPrefetchResponse(requestedCount: number): SegmentPrefetchResponseDto {
        return {
            success: true,
            message: `${requestedCount}개 세그먼트 프리페치 완료`,
        };
    }

    private applyCorsHeaders(res: Response): void {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
}
