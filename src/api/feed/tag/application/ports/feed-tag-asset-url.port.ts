export const FEED_TAG_ASSET_URL_PORT = Symbol('FEED_TAG_ASSET_URL_PORT');

export interface FeedTagAssetUrlPort {
    generateSignedUrl(fileKey: string, expirationMinutes?: number): string;
}
