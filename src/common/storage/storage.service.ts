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
import convert from 'heic-convert';
import { getErrorMessage, getErrorStatusCode, hasErrorName } from '../utils/error.util';

/**
 * 스마일서브 오브젝트 스토리지 서비스
 * OpenStack Swift 기반 (AWS S3 호환 API 사용)
 */
@Injectable()
export class StorageService {
    private static readonly LEGACY_BUCKET_NAMES = ['pawpong_bucket', 'pawpong_s3'];
    private s3: S3Client;
    private bucketName: string;
    private cdnBaseUrl: string;
    private readonly isTestMode: boolean;
    private readonly inMemoryObjects = new Map<
        string,
        {
            body: Buffer;
            contentType: string;
            lastModified: Date;
        }
    >();
    private readonly logger = new Logger(StorageService.name);

    constructor(private configService: ConfigService) {
        this.isTestMode = this.resolveTestMode();

        if (this.isTestMode) {
            this.bucketName = 'pawpong-test';
            // 이 분기는 NODE_ENV=test 에서만 도달한다(resolveTestMode 가 보장).
            // 실서버에서는 절대 켜지지 않으므로 여기서 CDN base 를 그대로 써도 안전하다.
            this.cdnBaseUrl = this.configService.get<string>('SMILESERV_CDN_BASE_URL') || 'https://cdn.test';
            this.logger.warn(
                '[StorageService] 테스트 모드 인메모리 스토리지를 사용합니다. 업로드는 프로세스 메모리에만 남고 재시작 시 사라집니다.',
            );
            return;
        }

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

            // 버킷과 CDN base 를 한 줄에 같이 찍는다. 둘이 어긋나면 업로드는 성공하고
            // 반환 URL 만 404 가 되므로, 사고 조사 때 이 줄만 보고 판별할 수 있어야 한다.
            this.logger.log(
                `[StorageService] SmileServ Config - Endpoint: ${endpoint}, Bucket: ${this.bucketName}, CDN: ${this.cdnBaseUrl}`,
            );

            this.assertBucketMatchesCdnBaseUrl(endpoint);

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
     * 인메모리 테스트 스토리지 사용 여부를 결정한다.
     *
     * 이 모드는 업로드를 프로세스 메모리 Map 에만 넣고 S3 를 호출하지 않는다.
     * 실서버에서 켜지면 업로드가 200 을 반환하고 DB 에 파일키까지 남지만 객체는
     * 어디에도 존재하지 않아 CDN 이 영구히 NoSuchKey 를 낸다. PutObject 후
     * HeadObject 검증도 이 분기의 early-return 뒤에 있어 우회된다.
     *
     * 그래서 NODE_ENV=test 가 아니면 부팅을 거부한다. 조용한 파일 유실보다
     * 기동 실패가 훨씬 싸다.
     */
    private resolveTestMode(): boolean {
        const requested =
            this.configService.get<string>('PAWPONG_TEST_MODE') === 'true' || process.env.PAWPONG_TEST_MODE === 'true';

        if (!requested) {
            return false;
        }

        const nodeEnv = this.configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
        if (nodeEnv === 'test') {
            return true;
        }

        throw new Error(
            `[StorageService] PAWPONG_TEST_MODE=true 는 NODE_ENV=test 에서만 허용됩니다 (현재 NODE_ENV=${nodeEnv ?? 'undefined'}). ` +
                '실서버에서 켜지면 업로드가 성공으로 응답하면서 파일이 저장되지 않습니다. 배포 환경 변수에서 PAWPONG_TEST_MODE 를 제거하세요.',
        );
    }

    /**
     * 업로드 대상 버킷과 조회용 CDN base URL 이 같은 버킷을 가리키는지 검증한다.
     *
     * 버킷만 교체하고 CDN 주소를 그대로 두면 PutObject/HeadObject 는 새 버킷에서
     * 성공하고 반환 URL 만 옛 버킷을 가리켜, 검증을 통과한 파일이 404 가 된다.
     *
     * 판정 기준은 CDN 호스트다.
     * - S3 엔드포인트와 같은 호스트 → path-style 로 버킷을 직접 노출하는 구성이므로
     *   경로가 정확히 `/<bucket>` 한 세그먼트여야 한다. 오타·새 버킷명·경로 누락은 물론
     *   버킷 앞에 상위 경로가 끼는 경우(`/foo/<bucket>`)도 막는다.
     * - 다른 호스트 → 버킷을 감싸는 CDN 도메인일 수 있어 경로만으로 단정하지 않고 경고만 남긴다.
     *   단, 우리가 쓰던 버킷 이름이 남아 있으면 교체 누락이 확실하므로 막는다.
     */
    private assertBucketMatchesCdnBaseUrl(endpoint: string): void {
        if (!this.cdnBaseUrl || !this.bucketName) {
            return;
        }

        let cdnUrl: URL;
        let endpointUrl: URL;
        try {
            cdnUrl = new URL(this.cdnBaseUrl);
            endpointUrl = new URL(endpoint);
        } catch {
            this.logger.warn(
                `[StorageService] CDN base URL 또는 엔드포인트를 URL 로 해석할 수 없어 버킷 정합 검사를 건너뜁니다 - ` +
                    `SMILESERV_CDN_BASE_URL=${this.cdnBaseUrl}, SMILESERV_S3_ENDPOINT=${endpoint}`,
            );
            return;
        }

        const segments = cdnUrl.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1] ?? '';

        const fail = (detail: string): never => {
            throw new Error(
                `[StorageService] ${detail} - ` +
                    `SMILESERV_S3_BUCKET=${this.bucketName}, SMILESERV_CDN_BASE_URL=${this.cdnBaseUrl}. ` +
                    '이 상태로 뜨면 업로드는 성공하고 조회 URL 만 404 가 됩니다. 두 값을 같은 버킷으로 맞추세요.',
            );
        };

        // CDN 호스트가 S3 엔드포인트와 같으면 path-style 로 버킷을 직접 노출하는 구성이다.
        // 이때 조회 URL 은 https://<host>/<bucket>/<key> 형태여야 하므로 경로는
        // 정확히 버킷 한 세그먼트다. 앞에 상위 경로가 끼면 버킷명이 마지막에 있어도
        // 실제 조회 경로가 어긋나므로 세그먼트 개수까지 함께 본다.
        if (cdnUrl.host === endpointUrl.host) {
            if (segments.length === 0) {
                fail('CDN base URL 에 버킷 경로가 없습니다');
            }
            if (segments.length > 1) {
                fail(`CDN base URL 의 버킷 경로는 한 단계여야 합니다 (현재 경로: /${segments.join('/')})`);
            }
            if (segments[0] !== this.bucketName) {
                fail('버킷과 CDN base URL 이 서로 다른 버킷을 가리킵니다');
            }
            return;
        }

        // 호스트가 다르면 버킷을 감싸는 별도 CDN 도메인일 수 있어 경로만으로 단정할 수 없다.
        if (lastSegment === this.bucketName) {
            return;
        }

        // 다만 우리가 쓰던 버킷 이름이 남아 있으면 버킷 교체 후 CDN 을 못 고친 경우가 확실하다.
        if (StorageService.LEGACY_BUCKET_NAMES.includes(lastSegment)) {
            fail('CDN base URL 이 예전 버킷을 그대로 가리킵니다');
        }

        if (segments.length > 0) {
            this.logger.warn(
                `[StorageService] CDN base URL 의 마지막 세그먼트(${lastSegment})가 버킷명(${this.bucketName})과 다릅니다. ` +
                    '버킷을 직접 노출하는 구성이라면 오설정입니다.',
            );
        }
    }

    // HEIC/HEIF 전용 major brand 목록 (ISOBMFF offset 8-12)
    private static readonly HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1'];
    private static readonly FTYP_SIG = Buffer.from([0x66, 0x74, 0x79, 0x70]); // 'ftyp'
    private static readonly VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

    /**
     * 파일 업로드
     * HEIC/HEIF 이미지는 자동으로 JPEG 변환 후 업로드 (브라우저 호환성)
     */
    async uploadFile(
        file: Express.Multer.File,
        folder: string = '',
    ): Promise<{ fileName: string; cdnUrl: string; storageUrl: string }> {
        // HEIC → JPEG 자동 변환 (모든 업로드 경로에서 일관 적용)
        file = await this.convertHeicToJpegIfNeeded(file);

        const fileName = this.generateFileName(file.originalname, this.normalizeFolder(folder));

        if (this.isTestMode) {
            this.inMemoryObjects.set(fileName, {
                body: Buffer.from(file.buffer || []),
                contentType: file.mimetype,
                lastModified: new Date(),
            });

            const cdnUrl = this.getCdnUrl(fileName);
            return { fileName, cdnUrl, storageUrl: cdnUrl };
        }

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
            await this.assertUploadedObjectExists(fileName);

            const cdnUrl = this.getCdnUrl(fileName);
            const storageUrl = cdnUrl; // 스마일서브는 CDN URL과 Storage URL이 동일

            this.logger.log(`File uploaded: ${fileName}`);
            return { fileName, cdnUrl, storageUrl };
        } catch (error) {
            this.logger.error(`Upload failed: ${getErrorMessage(error)}`);
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
        const objectKey = this.normalizeObjectKey(fileName);
        if (this.isTestMode) {
            this.inMemoryObjects.delete(objectKey);
            return;
        }

        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: objectKey,
            });

            await this.s3.send(command);
            this.logger.log(`File deleted: ${fileName}`);
        } catch (error) {
            this.logger.error(`Delete failed: ${getErrorMessage(error)}`);
            throw error;
        }
    }

    /**
     * 파일 존재 여부 확인
     */
    async fileExists(fileName: string): Promise<boolean> {
        const objectKey = this.normalizeObjectKey(fileName);
        if (this.isTestMode) {
            return this.inMemoryObjects.has(objectKey);
        }

        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: objectKey,
            });

            await this.s3.send(command);
            return true;
        } catch (error) {
            if (hasErrorName(error, 'NotFound') || getErrorStatusCode(error) === 404) {
                return false;
            }
            this.logger.error(`Check file existence failed: ${getErrorMessage(error)}`);
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
        return `${this.cdnBaseUrl}/${this.normalizeObjectKey(fileName)}`;
    }

    private stripBucketPrefix(filePath: string): string {
        const bucketNames = new Set([this.bucketName, ...StorageService.LEGACY_BUCKET_NAMES].filter(Boolean));

        for (const bucketName of bucketNames) {
            if (filePath.startsWith(`${bucketName}/`)) {
                return filePath.slice(`${bucketName}/`.length);
            }
        }

        return filePath;
    }

    private normalizeFolder(folder: string): string {
        return this.normalizeObjectKey(folder).replace(/\/+$/, '');
    }

    private normalizeObjectKey(filePath: string): string {
        if (!filePath) {
            return '';
        }

        let normalized = filePath.trim().replace(/^\/+/, '');

        if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
            try {
                const urlObj = new URL(normalized);
                normalized = urlObj.pathname.replace(/^\/+/, '');
            } catch {
                return normalized;
            }
        }

        return this.stripBucketPrefix(normalized);
    }

    private async assertUploadedObjectExists(fileName: string): Promise<void> {
        const objectKey = this.normalizeObjectKey(fileName);
        try {
            await this.s3.send(
                new HeadObjectCommand({
                    Bucket: this.bucketName,
                    Key: objectKey,
                }),
            );
        } catch (error) {
            this.logger.error(
                `[StorageService] Upload verification failed - bucket=${this.bucketName}, key=${objectKey}, url=${this.getCdnUrl(
                    objectKey,
                )}, reason=${getErrorMessage(error)}`,
            );
            throw error;
        }
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
                    if (pathParts[0] && this.stripBucketPrefix(`${pathParts[0]}/x`) !== `${pathParts[0]}/x`) {
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

        // 방어 로직: 파일 경로에 버킷 이름이 접두사로 포함된 경우 제거
        // (이전 버그로 인해 DB에 pawpong_bucket/representative/uuid.jpg 형태로 저장된 데이터 대응)
        filePath = this.normalizeObjectKey(filePath);

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
        if (this.isTestMode) {
            const keys = [...this.inMemoryObjects.entries()]
                .filter(([fileName]) => !prefix || fileName.startsWith(prefix))
                .slice(0, maxKeys);

            return {
                Contents: keys.map(([fileName, object]) => ({
                    Key: fileName,
                    Size: object.body.length,
                    LastModified: object.lastModified,
                    ETag: `"${fileName}"`,
                })),
                IsTruncated: this.inMemoryObjects.size > maxKeys,
                KeyCount: keys.length,
                $metadata: {},
            };
        }

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
        if (this.isTestMode) {
            return `https://upload.test/${fileKey}?expiresIn=${expirationSeconds}`;
        }

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
        if (this.isTestMode) {
            const object = this.inMemoryObjects.get(this.stripBucketPrefix(fileKey));
            fs.writeFileSync(localPath, object?.body || Buffer.alloc(0));
            return;
        }

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
        if (this.isTestMode) {
            this.inMemoryObjects.set(fileKey, {
                body: fs.readFileSync(localPath),
                contentType,
                lastModified: new Date(),
            });
            return;
        }

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
        if (this.isTestMode) {
            const object = this.inMemoryObjects.get(this.stripBucketPrefix(fileKey));
            return Readable.from(object?.body || Buffer.alloc(0));
        }

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

    /**
     * HEIC/HEIF 파일을 JPEG로 자동 변환
     * 동영상(MP4/MOV)은 ftyp box를 공유하므로 major brand로 구분
     * 변환 실패 시 원본 파일 그대로 반환 (업로드 차단하지 않음)
     */
    private async convertHeicToJpegIfNeeded(file: Express.Multer.File): Promise<Express.Multer.File> {
        // 동영상은 즉시 스킵
        if (StorageService.VIDEO_MIMES.includes(file.mimetype)) {
            return file;
        }

        // buffer가 없으면 스킵 (로컬 파일 업로드 등)
        if (!file.buffer || file.buffer.length < 12) {
            return file;
        }

        // 3중 감지: magic bytes + mimetype + 확장자
        const hasFtyp = file.buffer.subarray(4, 8).equals(StorageService.FTYP_SIG);
        const majorBrand = hasFtyp ? file.buffer.subarray(8, 12).toString('ascii') : '';
        const isHeicByMagic = hasFtyp && StorageService.HEIC_BRANDS.includes(majorBrand);
        const isHeicByMime = ['image/heic', 'image/heif'].includes(file.mimetype);
        const isHeicByExt = /\.(heic|heif)$/i.test(file.originalname);

        if (!isHeicByMagic && !isHeicByMime && !isHeicByExt) {
            return file;
        }

        try {
            this.logger.log(`[StorageService] HEIC 감지, JPEG 변환: ${file.originalname}`);
            const jpegBuffer = (await convert({
                buffer: file.buffer as unknown as ArrayBufferLike,
                format: 'JPEG',
                quality: 0.9,
            })) as unknown as Buffer;

            file.buffer = Buffer.from(jpegBuffer);
            file.mimetype = 'image/jpeg';
            file.size = file.buffer.length;
            file.originalname = file.originalname.replace(/\.(heic|heif)$/i, '.jpg');
            if (!file.originalname.endsWith('.jpg')) file.originalname += '.jpg';

            this.logger.log(`[StorageService] JPEG 변환 완료: ${file.originalname} (${file.size} bytes)`);
        } catch (error) {
            this.logger.warn(`[StorageService] HEIC 변환 실패, 원본 업로드: ${getErrorMessage(error)}`);
        }

        return file;
    }
}
