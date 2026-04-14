import type { CallHandler, ExecutionContext } from '@nestjs/common';
import type { Response } from 'express';
import { lastValueFrom, of } from 'rxjs';

import { FeedVideoStreamResponseInterceptor } from '../../../../video/presentation/interceptors/feed-video-stream-response.interceptor';

describe('피드 비디오 스트림 응답 인터셉터', () => {
    const createExecutionContext = (response: Response): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getResponse: () => response,
            }),
        }) as unknown as ExecutionContext;

    it('스트리밍 헤더를 적용하고 응답 본문만 반환한다', async () => {
        const response = {
            setHeader: jest.fn(),
        } as unknown as Response;
        const interceptor = new FeedVideoStreamResponseInterceptor();
        const next: CallHandler = {
            handle: () =>
                of({
                    body: '#EXTM3U',
                    contentType: 'application/vnd.apple.mpegurl',
                    cacheControl: 'public, max-age=3600',
                    cacheStatus: 'HIT',
                }),
        };

        const body = await lastValueFrom(interceptor.intercept(createExecutionContext(response), next));

        expect(response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
        expect(response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, OPTIONS');
        expect(response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
        expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.apple.mpegurl');
        expect(response.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
        expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
        expect(body).toBe('#EXTM3U');
    });
});
