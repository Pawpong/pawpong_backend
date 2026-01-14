import { Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import * as fs from 'fs/promises';
import * as path from 'path';

// FFmpeg/FFprobe 바이너리 경로 설정
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * FFmpeg 서비스
 * 동영상 인코딩, 썸네일 생성, 메타데이터 추출
 */
@Injectable()
export class FfmpegService {
    private readonly logger = new Logger(FfmpegService.name);

    /**
     * HLS 변환 (적응형 비트레이트)
     * @param inputFile 원본 동영상 파일 경로
     * @param outputDir HLS 파일 출력 디렉토리
     * @param resolutions 생성할 해상도 목록 (기본: 360p, 480p, 720p)
     */
    async convertToHLS(inputFile: string, outputDir: string, resolutions: number[] = [360, 480, 720]): Promise<void> {
        this.logger.log(`[convertToHLS] 시작: ${inputFile} -> ${outputDir}`);

        await fs.mkdir(outputDir, { recursive: true });

        // 각 해상도별로 변환
        for (const height of resolutions) {
            await this.convertResolution(inputFile, outputDir, height);
        }

        // Master playlist 생성
        await this.createMasterPlaylist(outputDir, resolutions);

        this.logger.log(`[convertToHLS] 완료: ${outputDir}`);
    }

    /**
     * 특정 해상도로 HLS 변환
     */
    private async convertResolution(inputFile: string, outputDir: string, height: number): Promise<void> {
        const bitrate = this.getBitrate(height);
        const outputFile = path.join(outputDir, `stream_${height}p.m3u8`);
        const segmentFile = path.join(outputDir, `stream_${height}p_%03d.ts`);

        this.logger.log(`[convertResolution] ${height}p 변환 시작 (bitrate: ${bitrate})`);

        return new Promise((resolve, reject) => {
            ffmpeg(inputFile)
                .outputOptions([
                    '-c:v libx264', // 비디오 코덱
                    '-c:a aac', // 오디오 코덱
                    `-b:v ${bitrate}`, // 비디오 비트레이트
                    '-b:a 128k', // 오디오 비트레이트
                    `-vf scale=-2:${height}`, // 해상도 (가로는 자동 조정, 2로 나누어떨어지게)
                    '-profile:v main', // H.264 프로필
                    '-preset fast', // 인코딩 속도 (fast, medium, slow)
                    '-hls_time 6', // 세그먼트 길이 (6초)
                    '-hls_playlist_type vod', // VOD 타입
                    '-hls_flags independent_segments', // 독립적인 세그먼트
                    `-hls_segment_filename ${segmentFile}`,
                ])
                .output(outputFile)
                .on('start', (commandLine) => {
                    this.logger.debug(`[FFmpeg] 명령어: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        this.logger.debug(`[${height}p] Progress: ${Math.floor(progress.percent)}%`);
                    }
                })
                .on('end', () => {
                    this.logger.log(`[convertResolution] ${height}p 변환 완료`);
                    resolve();
                })
                .on('error', (error) => {
                    this.logger.error(`[convertResolution] ${height}p 변환 실패:`, error);
                    reject(error);
                })
                .run();
        });
    }

    /**
     * Master Playlist 생성 (master.m3u8)
     */
    private async createMasterPlaylist(outputDir: string, resolutions: number[]): Promise<void> {
        let content = '#EXTM3U\n#EXT-X-VERSION:3\n';

        resolutions.forEach((height) => {
            const bitrate = parseInt(this.getBitrate(height)) * 1000; // kbps -> bps
            // 16:9 비율로 가로 해상도 계산 (2로 나누어 떨어지도록)
            const width = Math.round((height * 16) / 9 / 2) * 2;
            content += `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=${width}x${height}\n`;
            content += `stream_${height}p.m3u8\n`;
        });

        const masterFile = path.join(outputDir, 'master.m3u8');
        await fs.writeFile(masterFile, content);

        this.logger.log(`[createMasterPlaylist] 생성 완료: ${masterFile}`);
    }

    /**
     * 해상도별 권장 비트레이트 반환
     */
    private getBitrate(height: number): string {
        const bitrateMap: Record<number, string> = {
            360: '800k',
            480: '1400k',
            720: '2800k',
            1080: '5000k',
        };
        return bitrateMap[height] || '1400k';
    }

    /**
     * 썸네일 생성
     * @param videoFile 원본 동영상 파일 경로
     * @param outputFile 썸네일 출력 경로
     * @param timePercent 캡처 시점 (퍼센트, 기본 10%)
     */
    async generateThumbnail(videoFile: string, outputFile: string, timePercent: number = 10): Promise<void> {
        this.logger.log(`[generateThumbnail] 시작: ${videoFile} -> ${outputFile}`);

        return new Promise((resolve, reject) => {
            ffmpeg(videoFile)
                .screenshots({
                    timestamps: [`${timePercent}%`],
                    filename: path.basename(outputFile),
                    folder: path.dirname(outputFile),
                    size: '1280x720', // 썸네일 크기
                })
                .on('end', () => {
                    this.logger.log(`[generateThumbnail] 완료: ${outputFile}`);
                    resolve();
                })
                .on('error', (error) => {
                    this.logger.error(`[generateThumbnail] 실패:`, error);
                    reject(error);
                });
        });
    }

    /**
     * 동영상 길이 추출 (초 단위)
     */
    async getDuration(videoFile: string): Promise<number> {
        this.logger.log(`[getDuration] 동영상 길이 확인: ${videoFile}`);

        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoFile, (err, metadata) => {
                if (err) {
                    this.logger.error(`[getDuration] 실패:`, err);
                    reject(err);
                } else {
                    const duration = Math.floor(metadata.format.duration || 0);
                    this.logger.log(`[getDuration] 길이: ${duration}초`);
                    resolve(duration);
                }
            });
        });
    }

    /**
     * 동영상 메타데이터 추출 (해상도, 코덱 등)
     */
    async getVideoMetadata(videoFile: string): Promise<{
        duration: number;
        width: number;
        height: number;
        codec: string;
        bitrate: number;
    }> {
        this.logger.log(`[getVideoMetadata] 메타데이터 확인: ${videoFile}`);

        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoFile, (err, metadata) => {
                if (err) {
                    this.logger.error(`[getVideoMetadata] 실패:`, err);
                    reject(err);
                } else {
                    const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
                    const result = {
                        duration: Math.floor(metadata.format.duration || 0),
                        width: videoStream?.width || 0,
                        height: videoStream?.height || 0,
                        codec: videoStream?.codec_name || 'unknown',
                        bitrate: metadata.format.bit_rate || 0,
                    };
                    this.logger.log(`[getVideoMetadata] 결과:`, result);
                    resolve(result);
                }
            });
        });
    }
}
