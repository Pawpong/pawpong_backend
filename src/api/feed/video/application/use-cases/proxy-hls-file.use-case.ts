import { Inject, Injectable } from '@nestjs/common';

import { DomainError, DomainValidationError } from '../../../../../common/error/domain.error';
import { FEED_VIDEO_STREAM_PORT, type FeedVideoStreamPort } from '../ports/feed-video-stream.port';
import { FeedVideoStreamingService } from '../../domain/services/feed-video-streaming.service';

export interface FeedVideoProxyResponse {
    body: Buffer | string;
    contentType: string;
    cacheControl: string;
    cacheStatus: 'HIT' | 'MISS';
}

@Injectable()
export class ProxyHlsFileUseCase {
    constructor(
        @Inject(FEED_VIDEO_STREAM_PORT)
        private readonly feedVideoStream: FeedVideoStreamPort,
        private readonly feedVideoStreamingService: FeedVideoStreamingService,
    ) {}

    async execute(videoId: string, filename: string): Promise<FeedVideoProxyResponse> {
        try {
            return await this.buildProxyResponse(videoId, filename);
        } catch (error) {
            if (error instanceof DomainError) {
                throw error;
            }
            throw new DomainValidationError('파일을 가져올 수 없습니다.');
        }
    }

    private async buildProxyResponse(videoId: string, filename: string): Promise<FeedVideoProxyResponse> {
        const target = this.feedVideoStreamingService.getProxyTarget(videoId, filename);

        if (target.cacheKind === 'binary') {
            const cachedBuffer = await this.feedVideoStream.getBinaryCache(target.cacheKey);
            if (cachedBuffer) {
                return {
                    body: cachedBuffer,
                    contentType: target.contentType,
                    cacheControl: target.cacheControl,
                    cacheStatus: 'HIT',
                };
            }

            const buffer = await this.feedVideoStream.readFile(target.fileKey);
            await this.feedVideoStream.setBinaryCache(target.cacheKey, buffer, target.ttlSeconds);

            return {
                body: buffer,
                contentType: target.contentType,
                cacheControl: target.cacheControl,
                cacheStatus: 'MISS',
            };
        }

        const cachedContent = await this.feedVideoStream.getTextCache(target.cacheKey);
        if (cachedContent) {
            return {
                body: cachedContent,
                contentType: target.contentType,
                cacheControl: target.cacheControl,
                cacheStatus: 'HIT',
            };
        }

        const content = (await this.feedVideoStream.readFile(target.fileKey)).toString('utf-8');
        await this.feedVideoStream.setTextCache(target.cacheKey, content, target.ttlSeconds);

        return {
            body: content,
            contentType: target.contentType,
            cacheControl: target.cacheControl,
            cacheStatus: 'MISS',
        };
    }
}
