export const BREEDER_PET_POSTING_ASSET_URL_PORT = Symbol('BREEDER_PET_POSTING_ASSET_URL_PORT');

export interface BreederPetPostingAssetUrlPort {
    /**
     * 분양 펫 사진/이미지 파일명을 외부 노출 URL 로 변환한다.
     * 빈 문자열은 그대로 빈 문자열을 반환해도 무방하다 (DTO 가 fallback 처리).
     */
    toSignedUrl(fileName: string): string;
}
