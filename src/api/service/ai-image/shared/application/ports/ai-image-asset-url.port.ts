export const AI_IMAGE_ASSET_URL_PORT = Symbol('AI_IMAGE_ASSET_URL_PORT');

export interface AiImageAssetUrlPort {
    /** S3 파일키를 노출용 CDN URL 로 변환. 키가 없으면 undefined */
    toUrl(fileName: string | null | undefined): string | undefined;
}
