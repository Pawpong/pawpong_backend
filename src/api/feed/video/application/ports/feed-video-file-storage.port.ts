export const FEED_VIDEO_FILE_STORAGE_PORT = Symbol('FEED_VIDEO_FILE_STORAGE_PORT');

export interface FeedVideoFileStoragePort {
    generatePresignedUploadUrl(fileKey: string, expiresInSeconds: number): Promise<string>;
    deleteFile(fileKey: string): Promise<void>;
}
