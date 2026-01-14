import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import { Readable } from 'stream';

/**
 * 스마일서브 오브젝트 스토리지 서비스
 * OpenStack Swift 기반 (AWS S3 호환 API 사용)
 */
@Injectable()
export class StorageService {
    private s3: S3Client;
    private bucketName: string;
    private cdnBaseUrl: string;
    private readonly logger = new Logger(StorageService.name);

    constructor(private configService: ConfigService) {
        try {
            this.logger.log('[StorageService] Initializing SmileServ Object Storage...');

            const endpoint = this.configService.get<string>('SMILESERV_S3_ENDPOINT');
            const accessKeyId = this.configService.get<string>('SMILESERV_S3_ACCESS_KEY');
            const secretAccessKey = this.configService.get<string>('SMILESERV_S3_SECRET_KEY');
            this.bucketName = this.configService.get<string>('SMILESERV_S3_BUCKET') || '';
            this.cdnBaseUrl = this.configService.get<string>('SMILESERV_CDN_BASE_URL') || '';

            if (!endpoint || !accessKeyId || !secretAccessKey) {
                throw new Error('SmileServ S3 configuration is incomplete');
            }

            this.logger.log(`[StorageService] SmileServ Config - Endpoint: ${endpoint}, Bucket: ${this.bucketName}`);

            // AWS SDK v3 S3 클라이언트 설정 (스마일서브 호환)
            this.s3 = new S3Client({
                endpoint: endpoint,
                credentials: {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey,
                },
                region: 'default', // 스마일서브는 단일 리전
                forcePathStyle: true, // Path style URL 사용 필수
            });

            this.logger.log('[StorageService] SmileServ Object Storage initialized successfully');
        } catch (error) {
            this.logger.error('[StorageService] Failed to initialize SmileServ Storage:', error);
            throw error;
        }
    }

    /**
     * 파일 업로드
     */
    async uploadFile(
        file: Express.Multer.File,
        folder: string = '',
    ): Promise<{ fileName: string; cdnUrl: string; storageUrl: string }> {
        const fileName = this.generateFileName(file.originalname, folder);

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read', // 공개 읽기 권한
                CacheControl: 'public, max-age=31536000, immutable', // 1년 캐싱
            });

            await this.s3.send(command);

            const cdnUrl = this.getCdnUrl(fileName);
            const storageUrl = cdnUrl; // 스마일서브는 CDN URL과 Storage URL이 동일

            this.logger.log(`File uploaded: ${fileName}`);
            return { fileName, cdnUrl, storageUrl };
        } catch (error) {
            this.logger.error(`Upload failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * 다중 파일 업로드
     */
    async uploadMultipleFiles(
        files: Express.Multer.File[],
        folder: string = '',
    ): Promise<Array<{ fileName: string; cdnUrl: string; storageUrl: string }>> {
        const uploadPromises = files.map((file) => this.uploadFile(file, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * 파일 삭제
     */
    async deleteFile(fileName: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
            });

            await this.s3.send(command);
            this.logger.log(`File deleted: ${fileName}`);
        } catch (error) {
            this.logger.error(`Delete failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * 파일 존재 여부 확인
     */
    async fileExists(fileName: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
            });

            await this.s3.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return false;
            }
            this.logger.error(`Check file existence failed: ${error.message}`);
            return false;
        }
    }

    /**
     * 파일명 생성 (UUID + 원본 확장자)
     */
    private generateFileName(originalName: string, folder: string): string {
        const ext = originalName.split('.').pop();
        const uniqueName = `${uuidv4()}.${ext}`;
        return folder ? `${folder}/${uniqueName}` : uniqueName;
    }

    /**
     * CDN URL 생성 (스마일서브는 공개 URL 직접 반환)
     */
    getCdnUrl(fileName: string): string {
        return `${this.cdnBaseUrl}/${fileName}`;
    }

    /**
     * Signed URL 생성 (스마일서브는 공개 파일이므로 일반 URL 반환)
     * 기존 GCP CDN Signed URL 호환을 위해 메서드 유지
     */
    generateSignedUrl(fileName: string, expirationMinutes: number = 60): string {
        let filePath = fileName;

        // URL인 경우 파일 경로만 추출
        if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
            try {
                const urlObj = new URL(fileName);
                // 스마일서브 도메인인 경우 경로 추출
                if (urlObj.hostname.includes('object.iwinv.kr')) {
                    // pathname에서 버킷 이름 제거: /pawpong_bucket/path/file.jpg -> path/file.jpg
                    const pathParts = urlObj.pathname.split('/').filter((p) => p);
                    if (pathParts[0] === this.bucketName) {
                        pathParts.shift(); // 버킷 이름 제거
                    }
                    filePath = pathParts.join('/');
                } else {
                    // 외부 URL은 그대로 반환
                    return fileName;
                }
            } catch {
                // URL 파싱 실패 시 그대로 반환
                return fileName;
            }
        }

        // 스마일서브는 공개 버킷이므로 만료 시간 없이 URL 반환
        // 민감한 파일의 경우 향후 Pre-signed URL 구현 가능
        return this.getCdnUrl(filePath);
    }

    /**
     * 파일명 배열을 URL 배열로 변환
     */
    generateSignedUrls(fileNames: string[], expirationMinutes: number = 60): string[] {
        if (!fileNames || fileNames.length === 0) {
            return [];
        }
        return fileNames
            .filter((fileName) => fileName && fileName.trim() !== '')
            .map((fileName) => this.generateSignedUrl(fileName, expirationMinutes));
    }

    /**
     * 단일 파일명을 URL로 변환 (null-safe)
     */
    generateSignedUrlSafe(fileName: string | null | undefined, expirationMinutes: number = 60): string | undefined {
        if (!fileName || fileName.trim() === '') {
            return undefined;
        }
        return this.generateSignedUrl(fileName, expirationMinutes);
    }

    /**
     * 버킷 내 파일 목록 조회 (Admin용)
     */
    async listObjects(prefix?: string, maxKeys: number = 1000) {
        const command = new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix || '',
            MaxKeys: maxKeys,
        });

        return await this.s3.send(command);
    }

    /**
     * 버킷 이름 반환
     */
    getBucketName(): string {
        return this.bucketName;
    }

    /**
     * Presigned Upload URL 생성
     * 클라이언트가 직접 S3로 업로드할 수 있는 URL 제공
     * @param fileKey S3 파일 키 (예: videos/raw/{uuid}.mp4)
     * @param expirationSeconds URL 유효 시간 (초)
     * @returns Presigned URL
     */
    async generatePresignedUploadUrl(fileKey: string, expirationSeconds: number = 600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            ACL: 'public-read',
        });

        const url = await getSignedUrl(this.s3, command, {
            expiresIn: expirationSeconds,
        });

        this.logger.log(`[generatePresignedUploadUrl] Generated upload URL for: ${fileKey}`);
        return url;
    }

    /**
     * 파일 다운로드 (로컬 경로로 저장)
     * @param fileKey S3 파일 키
     * @param localPath 로컬 저장 경로
     */
    async downloadFile(fileKey: string, localPath: string): Promise<void> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            const response = await this.s3.send(command);

            // ReadableStream을 파일로 저장
            const stream = response.Body as Readable;
            const writeStream = fs.createWriteStream(localPath);

            await new Promise<void>((resolve, reject) => {
                stream.pipe(writeStream);
                stream.on('error', reject);
                writeStream.on('finish', () => resolve());
                writeStream.on('error', reject);
            });

            this.logger.log(`[downloadFile] Downloaded: ${fileKey} -> ${localPath}`);
        } catch (error) {
            this.logger.error(`[downloadFile] Failed to download ${fileKey}:`, error);
            throw error;
        }
    }

    /**
     * 로컬 파일을 S3에 업로드 (Worker에서 사용)
     * @param localPath 로컬 파일 경로
     * @param fileKey S3 파일 키
     * @param contentType MIME 타입
     */
    async uploadLocalFile(
        localPath: string,
        fileKey: string,
        contentType: string = 'application/octet-stream',
    ): Promise<void> {
        try {
            const fileContent = fs.readFileSync(localPath);

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: fileContent,
                ContentType: contentType,
                ACL: 'public-read',
                CacheControl: 'public, max-age=31536000, immutable',
            });

            await this.s3.send(command);

            this.logger.log(`[uploadLocalFile] Uploaded: ${localPath} -> ${fileKey}`);
        } catch (error) {
            this.logger.error(`[uploadLocalFile] Failed to upload ${localPath}:`, error);
            throw error;
        }
    }

    /**
     * S3 파일 스트림 가져오기 (HLS 프록시용)
     * @param fileKey S3 파일 키
     * @returns Readable 스트림
     */
    async getFileStream(fileKey: string): Promise<Readable> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            const response = await this.s3.send(command);

            this.logger.log(`[getFileStream] Streaming: ${fileKey}`);
            return response.Body as Readable;
        } catch (error) {
            this.logger.error(`[getFileStream] Failed to get stream for ${fileKey}:`, error);
            throw error;
        }
    }
}
