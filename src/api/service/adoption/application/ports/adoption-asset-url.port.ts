export const ADOPTION_ASSET_URL_PORT = Symbol('ADOPTION_ASSET_URL_PORT');

export interface AdoptionAssetUrlPort {
    generateSignedUrl(fileName: string, expirationMinutes?: number): Promise<string>;
}
