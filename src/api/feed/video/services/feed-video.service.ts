import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Response } from 'express';

import { StorageService } from '../../../../common/storage/storage.service';
import { RedisService } from '../../../../common/redis/redis.module';

import { Video, VideoStatus } from '../../../../schema/video.schema';
import { GetFeedUseCase } from '../application/use-cases/get-feed.use-case';
import { GetPopularVideosUseCase } from '../application/use-cases/get-popular-videos.use-case';
import { GetVideoMetaUseCase } from '../application/use-cases/get-video-meta.use-case';
import { GetUploadUrlUseCase } from '../application/use-cases/get-upload-url.use-case';
import { CompleteUploadUseCase } from '../application/use-cases/complete-upload.use-case';
import { GetMyVideosUseCase } from '../application/use-cases/get-my-videos.use-case';
import { DeleteVideoUseCase } from '../application/use-cases/delete-video.use-case';
import { ToggleVideoVisibilityUseCase } from '../application/use-cases/toggle-video-visibility.use-case';

/**
 * 피드 동영상 서비스
 * - Redis 캐싱으로 S3 요청 최소화
 * - BullMQ로 인코딩 작업 비동기 처리
 */
@Injectable()
export class FeedVideoService {
    private readonly logger = new Logger(FeedVideoService.name);

    constructor(
        @InjectModel(Video.name) private videoModel: Model<Video>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private storageService: StorageService,
        private redisService: RedisService,
        private readonly getFeedUseCase: GetFeedUseCase,
        private readonly getPopularVideosUseCase: GetPopularVideosUseCase,
        private readonly getVideoMetaUseCase: GetVideoMetaUseCase,
        private readonly getUploadUrlUseCase: GetUploadUrlUseCase,
        private readonly completeUploadUseCase: CompleteUploadUseCase,
        private readonly getMyVideosUseCase: GetMyVideosUseCase,
        private readonly deleteVideoUseCase: DeleteVideoUseCase,
        private readonly toggleVideoVisibilityUseCase: ToggleVideoVisibilityUseCase,
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

        // DB 업데이트 (await 없이 비동기로 처리)
        this.videoModel
            .updateOne({ _id: videoId }, { $inc: { viewCount: 1 } })
            .exec()
            .catch((err) => {
                this.logger.error(`[incrementViewCount] 조회수 증가 실패:`, err);
            });

        // 캐시 무효화
        await this.cacheManager.del(`video:meta:${videoId}`);
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
        data: {
            hlsManifestKey: string;
            thumbnailKey: string;
            duration: number;
            width: number;
            height: number;
        },
    ) {
        await this.videoModel.updateOne(
            { _id: videoId },
            {
                status: VideoStatus.READY,
                hlsManifestKey: data.hlsManifestKey,
                thumbnailKey: data.thumbnailKey,
                duration: data.duration,
                width: data.width,
                height: data.height,
            },
        );

        this.logger.log(`[updateEncodingComplete] 인코딩 완료 - videoId: ${videoId}`);
    }

    /**
     * 인코딩 실패 처리 (Worker에서 호출)
     */
    async updateEncodingFailed(videoId: string, reason: string) {
        await this.videoModel.updateOne(
            { _id: videoId },
            {
                status: VideoStatus.FAILED,
                failureReason: reason,
            },
        );

        this.logger.log(`[updateEncodingFailed] 인코딩 실패 - videoId: ${videoId}, reason: ${reason}`);
    }

    /**
     * HLS 파일 프록시 (CORS 우회 + Redis 캐싱)
     * S3의 HLS 파일을 백엔드를 통해 프록시하여 CORS 문제 해결
     * .ts 세그먼트는 Redis에 캐싱하여 화질 전환 시 지연 최소화
     */
    async proxyHLSFile(videoId: string, filename: string, res: Response) {
        // 파일 확장자 검증 (보안)
        const allowedExtensions = ['.m3u8', '.ts'];
        const ext = filename.substring(filename.lastIndexOf('.'));
        if (!allowedExtensions.includes(ext)) {
            throw new BadRequestException('허용되지 않은 파일 형식입니다.');
        }

        // Content-Type 설정
        let contentType = 'application/octet-stream';
        if (filename.endsWith('.m3u8')) {
            contentType = 'application/vnd.apple.mpegurl';
        } else if (filename.endsWith('.ts')) {
            contentType = 'video/mp2t';
        }

        // CORS 헤더 설정
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', contentType);

        // S3 키 구성
        const s3Key = `videos/hls/${videoId}/${filename}`;
        const cacheKey = `hls:${videoId}:${filename}`;

        try {
            // .ts 세그먼트 파일은 Redis 캐싱 (불변 파일이므로 장기 캐싱 가능)
            if (filename.endsWith('.ts')) {
                // Redis에서 캐시된 데이터 확인 (직접 ioredis 사용)
                const cachedData = await this.redisService.get(cacheKey);

                if (cachedData) {
                    this.logger.debug(`[proxyHLSFile] Redis 캐시 히트 - ${filename}`);
                    res.setHeader('X-Cache', 'HIT');
                    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24시간 브라우저 캐싱
                    // Base64 디코딩하여 Buffer로 전송
                    const buffer = Buffer.from(cachedData, 'base64');
                    return res.send(buffer);
                }

                // S3에서 파일 가져오기
                this.logger.debug(`[proxyHLSFile] Redis 캐시 미스, S3 요청 - ${filename}`);
                const fileStream = await this.storageService.getFileStream(s3Key);
                const chunks: Buffer[] = [];
                for await (const chunk of fileStream) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);

                // Redis에 Base64로 캐싱 (3600초 = 1시간 TTL)
                // 초기 서비스라 유저/영상 적으므로 넉넉하게 설정
                await this.redisService.set(cacheKey, buffer.toString('base64'), 3600);

                res.setHeader('X-Cache', 'MISS');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                return res.send(buffer);
            }

            // m3u8 파일은 캐싱 시간 짧게 (변경될 수 있음, 하지만 VOD는 불변)
            if (filename.endsWith('.m3u8')) {
                const cachedContent = await this.redisService.get(cacheKey);

                if (cachedContent) {
                    this.logger.debug(`[proxyHLSFile] Redis 캐시 히트 - ${filename}`);
                    res.setHeader('X-Cache', 'HIT');
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    return res.send(cachedContent);
                }

                const fileStream = await this.storageService.getFileStream(s3Key);
                const chunks: Buffer[] = [];
                for await (const chunk of fileStream) {
                    chunks.push(chunk);
                }
                const content = Buffer.concat(chunks).toString('utf-8');

                // Redis에 캐싱 (1800초 = 30분 TTL)
                await this.redisService.set(cacheKey, content, 1800);

                res.setHeader('X-Cache', 'MISS');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                return res.send(content);
            }
        } catch (error) {
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

        for (const height of resolutions) {
            // 각 화질의 처음 3개 세그먼트 프리로드
            for (let i = 0; i <= 2; i++) {
                const filename = `stream_${height}p_${String(i).padStart(3, '0')}.ts`;
                const s3Key = `videos/hls/${videoId}/${filename}`;
                const cacheKey = `hls:${videoId}:${filename}`;

                try {
                    // 이미 캐시되어 있으면 스킵
                    const cached = await this.redisService.exists(cacheKey);
                    if (cached) continue;

                    const fileStream = await this.storageService.getFileStream(s3Key);
                    const chunks: Buffer[] = [];
                    for await (const chunk of fileStream) {
                        chunks.push(chunk);
                    }
                    const buffer = Buffer.concat(chunks);

                    await this.redisService.set(cacheKey, buffer.toString('base64'), 3600);
                    this.logger.debug(`[preloadHLSSegments] 프리로드 완료 - ${filename}`);
                } catch (error) {
                    // 파일이 없을 수 있음 (해당 해상도가 없는 경우)
                    this.logger.debug(`[preloadHLSSegments] 프리로드 스킵 - ${filename}`);
                }
            }
        }

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

        const prefetchPromises: Promise<void>[] = [];

        for (const height of resolutions) {
            for (let i = 0; i < count; i++) {
                const segmentNum = currentSegment + i;
                const filename = `stream_${height}p_${String(segmentNum).padStart(3, '0')}.ts`;
                const cacheKey = `hls:${videoId}:${filename}`;

                // 병렬로 프리페치 실행
                prefetchPromises.push(
                    (async () => {
                        try {
                            // 이미 캐시되어 있으면 스킵
                            const cached = await this.redisService.exists(cacheKey);
                            if (cached) {
                                this.logger.debug(`[prefetchAllQualitySegments] 이미 캐시됨 - ${filename}`);
                                return;
                            }

                            const s3Key = `videos/hls/${videoId}/${filename}`;
                            const fileStream = await this.storageService.getFileStream(s3Key);
                            const chunks: Buffer[] = [];
                            for await (const chunk of fileStream) {
                                chunks.push(chunk);
                            }
                            const buffer = Buffer.concat(chunks);

                            await this.redisService.set(cacheKey, buffer.toString('base64'), 3600);
                            this.logger.debug(`[prefetchAllQualitySegments] 프리페치 완료 - ${filename}`);
                        } catch (error) {
                            // 파일이 없을 수 있음 (영상 끝 또는 해당 해상도 없음)
                            this.logger.debug(`[prefetchAllQualitySegments] 프리페치 스킵 - ${filename}`);
                        }
                    })(),
                );
            }
        }

        // 모든 프리페치 병렬 실행 (최대한 빠르게)
        await Promise.allSettled(prefetchPromises);

        this.logger.log(`[prefetchAllQualitySegments] 프리페치 완료 - ${resolutions.length * count}개 세그먼트 처리`);
    }
}
