export const PROFILE_ASSET_URL_PORT = Symbol('PROFILE_ASSET_URL_PORT');

export interface ProfileAssetUrlPort {
    /**
     * 프로필 이미지 파일명을 외부 노출 URL 로 변환한다.
     * 비어있으면 undefined 반환.
     */
    toProfileImageUrl(fileName?: string | null): string | undefined;
}
