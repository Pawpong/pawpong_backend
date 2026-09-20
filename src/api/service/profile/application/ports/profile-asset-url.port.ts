export const PROFILE_ASSET_URL_PORT = Symbol('PROFILE_ASSET_URL_PORT');

export interface ProfileAssetUrlPort {
    /**
     * 프로필 이미지 파일명을 외부 노출 URL 로 변환한다.
     * 비어있으면 undefined 반환.
     */
    toProfileImageUrl(fileName?: string | null): string | undefined;

    /**
     * 대표 사진 파일명 목록을 외부 노출 URL 목록으로 변환한다.
     * 비어있는 파일명은 제외하므로 결과 길이가 입력보다 짧을 수 있다.
     */
    toPhotoUrls(fileNames?: string[] | null): string[];
}
