export const FEED_LIKE_ASSET_URL = Symbol('FEED_LIKE_ASSET_URL');

export interface FeedLikeAssetUrlPort {
    generateSignedUrl(fileKey: string, expirationMinutes?: number): string;
}
