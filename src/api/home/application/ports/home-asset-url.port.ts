export const HOME_ASSET_URL_PORT = Symbol('HOME_ASSET_URL_PORT');

export interface HomeAssetUrlPort {
    generateSignedUrl(fileName: string, expirationMinutes?: number): string;
}
