export const AI_IMAGE_FILE_STORAGE_PORT = Symbol('AI_IMAGE_FILE_STORAGE_PORT');

export interface AiImageFileStoragePort {
    /** 클라이언트가 버킷에 직접 업로드할 presigned PUT URL 발급 */
    generatePresignedUploadUrl(fileKey: string, expiresInSeconds: number): Promise<string>;
}
