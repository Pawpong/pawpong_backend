import type { Readable } from 'stream';

export const AI_IMAGE_FILE_STORAGE_PORT = Symbol('AI_IMAGE_FILE_STORAGE_PORT');

export interface AiImageFileStoragePort {
    /** 클라이언트가 버킷에 직접 업로드할 presigned PUT URL 발급 */
    generatePresignedUploadUrl(fileKey: string, expiresInSeconds: number): Promise<string>;

    /**
     * 서버를 거쳐 버킷에 올린다.
     * 버킷에 CORS 가 없어 브라우저·웹뷰의 presigned PUT 이 preflight(403)에서 막히므로,
     * 화면에서 올리는 경로는 이쪽을 쓴다. 입력은 10MB 상한이라 2 vCPU 에 부담이 작다.
     */
    upload(fileKey: string, body: Buffer, contentType: string): Promise<void>;

    /** 저장된 이미지를 스트림으로 연다 (결과 이미지 전달용) */
    openStream(fileKey: string): Promise<Readable>;
}
