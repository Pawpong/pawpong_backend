export const CONTEST_ASSET_URL_PORT = Symbol('CONTEST_ASSET_URL_PORT');

export interface ContestAssetUrlPort {
    generateSignedUrl(fileName: string): Promise<string>;
}
