export const FEED_LIKE_ASSET_URL_PORT = Symbol('FEED_LIKE_ASSET_URL_PORT');

export interface FeedLikeAssetUrlPort {
    generateSignedUrl(fileKey: string, expirationMinutes?: number): string;
}
