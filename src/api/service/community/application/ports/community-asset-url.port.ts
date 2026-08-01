export const COMMUNITY_ASSET_URL_PORT = Symbol('COMMUNITY_ASSET_URL_PORT');

export interface CommunityAssetUrlPort {
    /**
     * 파일명을 외부 노출 signed URL 로 변환. 빈 값이면 undefined.
     */
    toSignedUrl(fileName?: string | null): string | undefined;
}
