export const HOME_ASSET_URL = Symbol('HOME_ASSET_URL');

export interface HomeAssetUrlPort {
    generateSignedUrl(fileName: string, expirationMinutes?: number): string;
}
