export const FEED_VIDEO_ASSET_URL_PORT = Symbol('FEED_VIDEO_ASSET_URL_PORT');

export interface FeedVideoAssetUrlPort {
    getSignedUrl(fileKey: string, ttlSeconds: number): Promise<string>;
}
