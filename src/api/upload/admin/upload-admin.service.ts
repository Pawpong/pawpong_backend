import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

import { StorageService } from '../../../common/storage/storage.service';
import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { StorageFileResponseDto } from './dto/response/storage-file-response.dto';
import { StorageListResponseDto } from './dto/response/storage-list-response.dto';

/**
 * Admin용 스토리지 관리 서비스
 */
@Injectable()
export class UploadAdminService {
    private s3: AWS.S3;
    private bucketName: string;
    private cdnBaseUrl: string;

    constructor(
        private readonly storageService: StorageService,
        private readonly logger: CustomLoggerService,
        private readonly configService: ConfigService,
    ) {
        this.s3 = new AWS.S3({
            endpoint: this.configService.get<string>('SMILESERV_S3_ENDPOINT'),
            accessKeyId: this.configService.get<string>('SMILESERV_S3_ACCESS_KEY'),
            secretAccessKey: this.configService.get<string>('SMILESERV_S3_SECRET_KEY'),
            region: 'default',
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
            sslEnabled: true,
        });
        this.bucketName = this.configService.get<string>('SMILESERV_S3_BUCKET') || '';
        this.cdnBaseUrl = this.configService.get<string>('SMILESERV_CDN_BASE_URL') || '';
    }

    /**
     * 버킷 내 전체 파일 목록 조회
     */
    async listAllFiles(prefix?: string): Promise<StorageListResponseDto> {
        this.logger.logStart('listAllFiles', '스토리지 파일 목록 조회 시작', { prefix });

        try {
            const params: AWS.S3.ListObjectsV2Request = {
                Bucket: this.bucketName,
                Prefix: prefix || '',
                MaxKeys: 1000,
            };

            const result = await this.s3.listObjectsV2(params).promise();

            const files: StorageFileResponseDto[] =
                result.Contents?.map((item) => ({
                    key: item.Key || '',
                    size: item.Size || 0,
                    lastModified: item.LastModified || new Date(),
                    url: `${this.cdnBaseUrl}/${item.Key}`,
                    folder: this.extractFolder(item.Key || ''),
                })) || [];

            const folderStats = this.calculateFolderStats(files);

            this.logger.logSuccess('listAllFiles', '파일 목록 조회 완료', {
                totalFiles: files.length,
                folders: Object.keys(folderStats).length,
            });

            return {
                files,
                totalFiles: files.length,
                folderStats,
                isTruncated: result.IsTruncated || false,
            };
        } catch (error) {
            this.logger.logError('listAllFiles', '파일 목록 조회 실패', error);
            throw new BadRequestException('파일 목록을 조회할 수 없습니다.');
        }
    }

    /**
     * 특정 폴더의 파일 목록 조회
     */
    async listFilesByFolder(folder: string): Promise<StorageListResponseDto> {
        this.logger.logStart('listFilesByFolder', '폴더별 파일 목록 조회', { folder });

        const prefix = folder.endsWith('/') ? folder : `${folder}/`;

        return this.listAllFiles(prefix);
    }

    /**
     * 파일 삭제
     */
    async deleteFile(fileName: string): Promise<void> {
        this.logger.logStart('deleteFile', '파일 삭제 시작', { fileName });

        if (!fileName) {
            throw new BadRequestException('파일명이 필요합니다.');
        }

        try {
            await this.storageService.deleteFile(fileName);
            this.logger.logSuccess('deleteFile', '파일 삭제 완료', { fileName });
        } catch (error) {
            this.logger.logError('deleteFile', '파일 삭제 실패', error);
            throw new BadRequestException('파일을 삭제할 수 없습니다.');
        }
    }

    /**
     * 다중 파일 삭제
     */
    async deleteMultipleFiles(fileNames: string[]): Promise<{ deletedCount: number; failedFiles: string[] }> {
        this.logger.logStart('deleteMultipleFiles', '다중 파일 삭제 시작', { count: fileNames.length });

        if (!fileNames || fileNames.length === 0) {
            throw new BadRequestException('삭제할 파일이 없습니다.');
        }

        const failedFiles: string[] = [];
        let deletedCount = 0;

        for (const fileName of fileNames) {
            try {
                await this.storageService.deleteFile(fileName);
                deletedCount++;
            } catch (error) {
                this.logger.logWarning('deleteMultipleFiles', `파일 삭제 실패: ${fileName}`, { error });
                failedFiles.push(fileName);
            }
        }

        this.logger.logSuccess('deleteMultipleFiles', '다중 파일 삭제 완료', {
            deletedCount,
            failedCount: failedFiles.length,
        });

        return { deletedCount, failedFiles };
    }

    /**
     * 폴더 전체 삭제
     */
    async deleteFolder(folder: string): Promise<{ deletedCount: number; failedFiles: string[] }> {
        this.logger.logStart('deleteFolder', '폴더 전체 삭제 시작', { folder });

        const { files } = await this.listFilesByFolder(folder);

        if (files.length === 0) {
            throw new BadRequestException('삭제할 파일이 없습니다.');
        }

        const fileNames = files.map((f) => f.key);
        const result = await this.deleteMultipleFiles(fileNames);

        this.logger.logSuccess('deleteFolder', '폴더 삭제 완료', result);

        return result;
    }

    /**
     * 파일 경로에서 폴더명 추출
     */
    private extractFolder(key: string): string {
        const parts = key.split('/');
        return parts.length > 1 ? parts[0] : 'root';
    }

    /**
     * 폴더별 통계 계산
     */
    private calculateFolderStats(files: StorageFileResponseDto[]): Record<string, { count: number; totalSize: number }> {
        const stats: Record<string, { count: number; totalSize: number }> = {};

        for (const file of files) {
            const folder = file.folder;
            if (!stats[folder]) {
                stats[folder] = { count: 0, totalSize: 0 };
            }
            stats[folder].count++;
            stats[folder].totalSize += file.size;
        }

        return stats;
    }
}
