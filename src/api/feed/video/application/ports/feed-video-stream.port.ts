export const FEED_VIDEO_STREAM = Symbol('FEED_VIDEO_STREAM');

export interface FeedVideoStreamPort {
    readFile(fileKey: string): Promise<Buffer>;
    getTextCache(cacheKey: string): Promise<string | null>;
    setTextCache(cacheKey: string, value: string, ttlSeconds: number): Promise<void>;
    getBinaryCache(cacheKey: string): Promise<Buffer | null>;
    setBinaryCache(cacheKey: string, value: Buffer, ttlSeconds: number): Promise<void>;
    hasCache(cacheKey: string): Promise<boolean>;
}
