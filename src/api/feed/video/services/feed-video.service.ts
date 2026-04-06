import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Response } from 'express';

import { GetFeedUseCase } from '../application/use-cases/get-feed.use-case';
import { GetPopularVideosUseCase } from '../application/use-cases/get-popular-videos.use-case';
import { GetVideoMetaUseCase } from '../application/use-cases/get-video-meta.use-case';
import { GetUploadUrlUseCase } from '../application/use-cases/get-upload-url.use-case';
import { CompleteUploadUseCase } from '../application/use-cases/complete-upload.use-case';
import { GetMyVideosUseCase } from '../application/use-cases/get-my-videos.use-case';
import { DeleteVideoUseCase } from '../application/use-cases/delete-video.use-case';
import { ToggleVideoVisibilityUseCase } from '../application/use-cases/toggle-video-visibility.use-case';
import { IncrementViewCountUseCase } from '../application/use-cases/increment-view-count.use-case';
import { UpdateEncodingCompleteUseCase } from '../application/use-cases/update-encoding-complete.use-case';
import { UpdateEncodingFailedUseCase } from '../application/use-cases/update-encoding-failed.use-case';
import { ProxyHlsFileUseCase } from '../application/use-cases/proxy-hls-file.use-case';
import { PreloadHlsSegmentsUseCase } from '../application/use-cases/preload-hls-segments.use-case';
import { PrefetchAllQualitySegmentsUseCase } from '../application/use-cases/prefetch-all-quality-segments.use-case';
import { FeedVideoEncodingResult } from '../application/ports/feed-video-command.port';

/**
 * 피드 동영상 서비스
 * - Redis 캐싱으로 S3 요청 최소화
 * - BullMQ로 인코딩 작업 비동기 처리
 */
@Injectable()
export class FeedVideoService {
    private readonly logger = new Logger(FeedVideoService.name);

    constructor(
        private readonly getFeedUseCase: GetFeedUseCase,
        private readonly getPopularVideosUseCase: GetPopularVideosUseCase,
        private readonly getVideoMetaUseCase: GetVideoMetaUseCase,
        private readonly getUploadUrlUseCase: GetUploadUrlUseCase,
        private readonly completeUploadUseCase: CompleteUploadUseCase,
        private readonly getMyVideosUseCase: GetMyVideosUseCase,
        private readonly deleteVideoUseCase: DeleteVideoUseCase,
        private readonly toggleVideoVisibilityUseCase: ToggleVideoVisibilityUseCase,
        private readonly incrementViewCountUseCase: IncrementViewCountUseCase,
        private readonly updateEncodingCompleteUseCase: UpdateEncodingCompleteUseCase,
        private readonly updateEncodingFailedUseCase: UpdateEncodingFailedUseCase,
        private readonly proxyHlsFileUseCase: ProxyHlsFileUseCase,
        private readonly preloadHlsSegmentsUseCase: PreloadHlsSegmentsUseCase,
        private readonly prefetchAllQualitySegmentsUseCase: PrefetchAllQualitySegmentsUseCase,
    ) {}

    /**
     * 업로드 URL 발급
     * 클라이언트가 직접 S3로 업로드할 수 있는 Presigned URL 제공
     */
    async getUploadUrl(
        userId: string,
        uploaderModel: 'Breeder' | 'Adopter',
        title: string,
        description?: string,
        tags?: string[],
    ) {
        this.logger.log(`[getUploadUrl] 업로드 URL 발급 요청 - userId: ${userId}`);
        const result = await this.getUploadUrlUseCase.execute(userId, uploaderModel, title, description, tags);
        this.logger.log(`[getUploadUrl] 동영상 레코드 생성 - videoId: ${result.videoId}`);
        return result;
    }

    /**
     * 업로드 완료 처리 (인코딩 시작)
     */
    async completeUpload(videoId: string, userId: string) {
        this.logger.log(`[completeUpload] 업로드 완료 알림 - videoId: ${videoId}`);
        const result = await this.completeUploadUseCase.execute(videoId, userId);
        this.logger.log(`[completeUpload] 인코딩 작업 큐에 추가됨 - videoId: ${videoId}`);
        return result;
    }

    /**
     * 동영상 메타데이터 조회 (Redis 캐싱)
     */
    async getVideoMeta(videoId: string) {
        return this.getVideoMetaUseCase.execute(videoId);
    }

    /**
     * 조회수 증가 (비동기, 응답 지연 없음)
     */
    async incrementViewCount(videoId: string) {
        this.logger.log(`[incrementViewCount] 조회수 증가 - videoId: ${videoId}`);
        await this.incrementViewCountUseCase.execute(videoId);
    }

    /**
     * 피드 조회 (최신순, Redis 캐싱)
     */
    async getFeed(page: number = 1, limit: number = 20) {
        return this.getFeedUseCase.execute(page, limit);
    }

    /**
     * 인기 동영상 조회 (조회수 기준)
     */
    async getPopularVideos(limit: number = 10) {
        return this.getPopularVideosUseCase.execute(limit);
    }

    /**
     * 내 동영상 목록 조회
     */
    async getMyVideos(userId: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[getMyVideos] 내 동영상 조회 - userId: ${userId}`);
        return this.getMyVideosUseCase.execute(userId, page, limit);
    }

    /**
     * 동영상 삭제
     */
    async deleteVideo(videoId: string, userId: string) {
        this.logger.log(`[deleteVideo] 동영상 삭제 - videoId: ${videoId}`);
        const result = await this.deleteVideoUseCase.execute(videoId, userId);
        this.logger.log(`[deleteVideo] 동영상 삭제 완료 - videoId: ${videoId}`);
        return result;
    }

    /**
     * 동영상 공개/비공개 전환
     */
    async toggleVisibility(videoId: string, userId: string) {
        this.logger.log(`[toggleVisibility] 공개 상태 전환 - videoId: ${videoId}`);
        return this.toggleVideoVisibilityUseCase.execute(videoId, userId);
    }

    /**
     * 인코딩 완료 처리 (Worker에서 호출)
     */
    async updateEncodingComplete(
        videoId: string,
        data: FeedVideoEncodingResult,
    ) {
        await this.updateEncodingCompleteUseCase.execute(videoId, data);
        this.logger.log(`[updateEncodingComplete] 인코딩 완료 - videoId: ${videoId}`);
    }

    /**
     * 인코딩 실패 처리 (Worker에서 호출)
     */
    async updateEncodingFailed(videoId: string, reason: string) {
        await this.updateEncodingFailedUseCase.execute(videoId, reason);
        this.logger.log(`[updateEncodingFailed] 인코딩 실패 - videoId: ${videoId}, reason: ${reason}`);
    }

    /**
     * HLS 파일 프록시 (CORS 우회 + Redis 캐싱)
     * S3의 HLS 파일을 백엔드를 통해 프록시하여 CORS 문제 해결
     * .ts 세그먼트는 Redis에 캐싱하여 화질 전환 시 지연 최소화
     */
    async proxyHLSFile(videoId: string, filename: string, res: Response) {
        // CORS 헤더 설정
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        try {
            const proxyResponse = await this.proxyHlsFileUseCase.execute(videoId, filename);

            res.setHeader('Content-Type', proxyResponse.contentType);
            res.setHeader('X-Cache', proxyResponse.cacheStatus);
            res.setHeader('Cache-Control', proxyResponse.cacheControl);

            return res.send(proxyResponse.body);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error(`[proxyHLSFile] 파일 프록시 실패 - ${filename}:`, error);
            throw new BadRequestException('파일을 가져올 수 없습니다.');
        }
    }

    /**
     * HLS 세그먼트 프리로드 (화질 전환 최적화)
     * 특정 화질의 초반 세그먼트들을 미리 캐싱
     */
    async preloadHLSSegments(videoId: string, resolutions: number[] = [360, 480, 720]) {
        this.logger.log(`[preloadHLSSegments] 세그먼트 프리로드 시작 - videoId: ${videoId}`);
        await this.preloadHlsSegmentsUseCase.execute(videoId, resolutions);

        this.logger.log(`[preloadHLSSegments] 세그먼트 프리로드 완료 - videoId: ${videoId}`);
    }

    /**
     * 모든 화질의 특정 구간 세그먼트 프리페치 (ABR 최적화)
     * 현재 재생 위치 기준으로 모든 화질의 세그먼트를 병렬로 캐싱
     * 화질 전환 시 끊김 없이 즉시 전환 가능
     */
    async prefetchAllQualitySegments(
        videoId: string,
        currentSegment: number,
        count: number = 5,
        resolutions: number[] = [360, 480, 720],
    ) {
        this.logger.log(
            `[prefetchAllQualitySegments] 프리페치 시작 - videoId: ${videoId}, segment: ${currentSegment}, count: ${count}`,
        );

        const processedCount = await this.prefetchAllQualitySegmentsUseCase.execute(
            videoId,
            currentSegment,
            count,
            resolutions,
        );

        this.logger.log(`[prefetchAllQualitySegments] 프리페치 완료 - ${processedCount}개 세그먼트 처리`);
    }
}
