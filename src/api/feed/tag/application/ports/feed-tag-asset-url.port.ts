export const FEED_TAG_ASSET_URL = Symbol('FEED_TAG_ASSET_URL');

export interface FeedTagAssetUrlPort {
    generateSignedUrl(fileKey: string, expirationMinutes?: number): string;
}
