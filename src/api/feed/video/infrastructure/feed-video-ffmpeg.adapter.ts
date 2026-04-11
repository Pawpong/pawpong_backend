import { Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import * as fs from 'fs/promises';
import * as path from 'path';

import type { FeedVideoMetadata, FeedVideoTranscoderPort } from '../application/ports/feed-video-transcoder.port';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

@Injectable()
export class FeedVideoFfmpegAdapter implements FeedVideoTranscoderPort {
    private readonly logger = new Logger(FeedVideoFfmpegAdapter.name);

    async convertToHLS(inputFile: string, outputDir: string, resolutions: number[] = [360, 480, 720]): Promise<void> {
        this.logger.log(`[convertToHLS] 시작: ${inputFile} -> ${outputDir}`);

        await fs.mkdir(outputDir, { recursive: true });

        for (const height of resolutions) {
            await this.convertResolution(inputFile, outputDir, height);
        }

        await this.createMasterPlaylist(outputDir, resolutions);

        this.logger.log(`[convertToHLS] 완료: ${outputDir}`);
    }

    async generateThumbnail(videoFile: string, outputFile: string, timePercent: number = 10): Promise<void> {
        this.logger.log(`[generateThumbnail] 시작: ${videoFile} -> ${outputFile}`);

        return new Promise((resolve, reject) => {
            ffmpeg(videoFile)
                .screenshots({
                    timestamps: [`${timePercent}%`],
                    filename: path.basename(outputFile),
                    folder: path.dirname(outputFile),
                    size: '1280x720',
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

    async getVideoMetadata(videoFile: string): Promise<FeedVideoMetadata> {
        this.logger.log(`[getVideoMetadata] 메타데이터 확인: ${videoFile}`);

        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoFile, (err, metadata) => {
                if (err) {
                    this.logger.error(`[getVideoMetadata] 실패:`, err);
                    reject(err);
                } else {
                    const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
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

    private async convertResolution(inputFile: string, outputDir: string, height: number): Promise<void> {
        const bitrate = this.getBitrate(height);
        const outputFile = path.join(outputDir, `stream_${height}p.m3u8`);
        const segmentFile = path.join(outputDir, `stream_${height}p_%03d.ts`);

        this.logger.log(`[convertResolution] ${height}p 변환 시작 (bitrate: ${bitrate})`);

        return new Promise((resolve, reject) => {
            ffmpeg(inputFile)
                .outputOptions([
                    '-c:v libx264',
                    '-c:a aac',
                    `-b:v ${bitrate}`,
                    '-b:a 128k',
                    `-vf scale=-2:${height}`,
                    '-profile:v main',
                    '-preset fast',
                    '-hls_time 6',
                    '-hls_playlist_type vod',
                    '-hls_flags independent_segments',
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

    private async createMasterPlaylist(outputDir: string, resolutions: number[]): Promise<void> {
        let content = '#EXTM3U\n#EXT-X-VERSION:3\n';

        resolutions.forEach((height) => {
            const bitrate = parseInt(this.getBitrate(height)) * 1000;
            const width = Math.round((height * 16) / 9 / 2) * 2;
            content += `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=${width}x${height}\n`;
            content += `stream_${height}p.m3u8\n`;
        });

        const masterFile = path.join(outputDir, 'master.m3u8');
        await fs.writeFile(masterFile, content);

        this.logger.log(`[createMasterPlaylist] 생성 완료: ${masterFile}`);
    }

    private getBitrate(height: number): string {
        const bitrateMap: Record<number, string> = {
            360: '800k',
            480: '1400k',
            720: '2800k',
            1080: '5000k',
        };
        return bitrateMap[height] || '1400k';
    }
}
