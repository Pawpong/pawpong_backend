export const INQUIRY_ASSET_URL = Symbol('INQUIRY_ASSET_URL');

export interface InquiryAssetUrlPort {
    generateSignedUrl(fileName: string, expirationMinutes?: number): string;
}
