export interface AdoptionBreederSummary {
    breederId: string;
    /** 표시용 닉네임 (Breeder.nickname || profile.brandName fallback) */
    displayName: string;
    /** 프로필 이미지 파일명 (signed URL 변환 전) */
    profileImageFileName?: string;
    /** 위치 — 디자인의 "독산동" 같은 표시. 시/구/동 중 가장 구체적인 값. */
    locationText?: string;
    /** Pawpong 자체 활동 점수. 미정 시 0 */
    bpm: number;
}

export const ADOPTION_BREEDER_SUMMARY_PORT = Symbol('ADOPTION_BREEDER_SUMMARY_PORT');

export interface AdoptionBreederSummaryPort {
    readSummary(breederId: string): Promise<AdoptionBreederSummary | null>;
}
