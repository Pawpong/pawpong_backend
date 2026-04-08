export const FEED_VIDEO_FILE_STORAGE = Symbol('FEED_VIDEO_FILE_STORAGE');

export interface FeedVideoFileStoragePort {
    generatePresignedUploadUrl(fileKey: string, expiresInSeconds: number): Promise<string>;
    deleteFile(fileKey: string): Promise<void>;
}
