export const INQUIRY_ASSET_URL_PORT = Symbol('INQUIRY_ASSET_URL_PORT');

export interface InquiryAssetUrlPort {
    generateSignedUrl(fileName: string, expirationMinutes?: number): string;
}
