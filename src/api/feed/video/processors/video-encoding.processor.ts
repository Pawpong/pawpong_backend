import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FfmpegService } from '../services/ffmpeg.service.js';
import { FeedVideoService } from '../services/feed-video.service.js';
import { StorageService } from '../../../../common/storage/storage.service.js';

/**
 * 동영상 인코딩 Worker
 * BullMQ 작업 큐에서 동영상 인코딩 작업을 처리
 */
@Processor('video', {
    concurrency: 1, // 동시에 1개만 처리 (CPU 부하 관리)
})
export class VideoEncodingProcessor extends WorkerHost {
    private readonly logger = new Logger(VideoEncodingProcessor.name);

    constructor(
        private readonly ffmpegService: FfmpegService,
        private readonly feedVideoService: FeedVideoService,
        private readonly storageService: StorageService,
    ) {
        super();
    }

    /**
     * 메인 작업 처리
     */
    async process(job: Job<{ videoId: string; originalKey: string }>) {
        const { videoId, originalKey } = job.data;

        this.logger.log(`[${videoId}] 인코딩 작업 시작`);
        this.logger.log(`[${videoId}] 원본 파일: ${originalKey}`);

        const tempDir = `/tmp/videos/${videoId}`;

        try {
            // 1. 임시 디렉토리 생성
            await fs.mkdir(tempDir, { recursive: true });
            await job.updateProgress(5);

            // 2. 원본 다운로드
            const originalFile = path.join(tempDir, 'original.mp4');
            this.logger.log(`[${videoId}] 원본 다운로드 시작`);
            await this.storageService.downloadFile(originalKey, originalFile);
            await job.updateProgress(15);
            this.logger.log(`[${videoId}] 원본 다운로드 완료`);

            // 3. 동영상 메타데이터 추출
            const metadata = await this.ffmpegService.getVideoMetadata(originalFile);
            this.logger.log(`[${videoId}] 메타데이터: ${JSON.stringify(metadata)}`);
            await job.updateProgress(20);

            // 4. HLS 변환
            const hlsDir = path.join(tempDir, 'hls');
            await fs.mkdir(hlsDir, { recursive: true });

            // 해상도 결정 (원본보다 높은 해상도는 제외)
            const resolutions = this.getResolutionsForVideo(metadata.height);
            this.logger.log(`[${videoId}] HLS 변환 시작 (해상도: ${resolutions.join(', ')}p)`);

            await this.ffmpegService.convertToHLS(originalFile, hlsDir, resolutions);
            await job.updateProgress(70);
            this.logger.log(`[${videoId}] HLS 변환 완료`);

            // 5. 썸네일 생성
            const thumbnailFile = path.join(tempDir, 'thumbnail.jpg');
            await this.ffmpegService.generateThumbnail(originalFile, thumbnailFile);
            await job.updateProgress(80);
            this.logger.log(`[${videoId}] 썸네일 생성 완료`);

            // 6. S3 업로드
            this.logger.log(`[${videoId}] S3 업로드 시작`);

            // HLS 파일들 업로드
            const hlsFiles = await fs.readdir(hlsDir);
            for (let i = 0; i < hlsFiles.length; i++) {
                const file = hlsFiles[i];
                const localPath = path.join(hlsDir, file);
                const s3Key = `videos/hls/${videoId}/${file}`;

                // 파일 타입에 따른 Content-Type 설정
                let contentType = 'application/octet-stream';
                if (file.endsWith('.m3u8')) {
                    contentType = 'application/vnd.apple.mpegurl';
                } else if (file.endsWith('.ts')) {
                    contentType = 'video/mp2t';
                }

                await this.storageService.uploadLocalFile(localPath, s3Key, contentType);

                // 진행률 업데이트
                const progress = 80 + Math.floor((i / hlsFiles.length) * 15);
                await job.updateProgress(progress);
            }

            // 썸네일 업로드
            const thumbnailKey = `videos/thumbnails/${videoId}.jpg`;
            await this.storageService.uploadLocalFile(thumbnailFile, thumbnailKey, 'image/jpeg');
            await job.updateProgress(98);
            this.logger.log(`[${videoId}] S3 업로드 완료`);

            // 7. DB 업데이트
            await this.feedVideoService.updateEncodingComplete(videoId, {
                hlsManifestKey: `videos/hls/${videoId}/master.m3u8`,
                thumbnailKey,
                duration: metadata.duration,
                width: metadata.width,
                height: metadata.height,
            });
            await job.updateProgress(100);

            this.logger.log(`[${videoId}] 인코딩 작업 완료!`);

            // 8. 임시 파일 삭제
            await fs.rm(tempDir, { recursive: true, force: true });

            return { success: true, videoId };
        } catch (error) {
            this.logger.error(`[${videoId}] 인코딩 작업 실패:`, error);

            // DB 상태 업데이트
            await this.feedVideoService.updateEncodingFailed(videoId, error.message || '알 수 없는 오류');

            // 임시 파일 정리
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                this.logger.warn(`[${videoId}] 임시 파일 정리 실패:`, cleanupError);
            }

            throw error;
        }
    }

    /**
     * 원본 해상도에 맞는 출력 해상도 목록 결정
     * 원본보다 높은 해상도는 제외하되, 최소 1개는 보장
     */
    private getResolutionsForVideo(originalHeight: number): number[] {
        const allResolutions = [360, 480, 720];
        const filtered = allResolutions.filter((res) => res <= originalHeight);

        // 원본이 360p 미만이면 360p만 생성 (업스케일링)
        if (filtered.length === 0) {
            return [360];
        }

        return filtered;
    }

    /**
     * 작업 완료 이벤트
     */
    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`[${job.data.videoId}] 작업 완료 (ID: ${job.id})`);
    }

    /**
     * 작업 실패 이벤트
     */
    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`[${job.data.videoId}] 작업 실패 (ID: ${job.id}): ${error.message}`);
    }

    /**
     * 작업 진행률 이벤트
     */
    @OnWorkerEvent('progress')
    onProgress(job: Job, progress: number) {
        this.logger.debug(`[${job.data.videoId}] 진행률: ${progress}%`);
    }
}
