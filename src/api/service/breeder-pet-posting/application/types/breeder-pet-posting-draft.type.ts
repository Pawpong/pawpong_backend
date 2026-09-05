/**
 * v2 분양글 임시저장 — application 계층 내부 타입.
 * HTTP DTO 와 분리된 use-case <-> port 간 모델.
 */

/** 작성 중 폼 payload — 작성 command 와 동일 shape 의 부분 집합 (전 필드 옵션) */
export type BreederPetPostingDraftForm = Record<string, unknown>;

export interface BreederPetPostingDraftSnapshot {
    draftId: string;
    breederId: string;
    form: BreederPetPostingDraftForm;
    updatedAt: Date;
}

export interface BreederPetPostingDraftSaveResult {
    draftId: string;
}

export interface BreederPetPostingDraftCardResult {
    draftId: string;
    name: string | null;
    breed: string | null;
    primaryPhotoUrl: string | null;
    updatedAt: string;
}

/**
 * 임시저장 사진의 표시용 URL.
 *
 * form 에는 파일키만 들어 있어 클라이언트가 미리보기를 그릴 수 없다.
 * (목록 카드는 primaryPhotoUrl 로 URL 을 받는데 단건만 키였다)
 * 재저장·발행 시에는 form 의 키를 그대로 돌려보내야 하므로 form 은 그대로 두고
 * 표시용 URL 을 같은 순서로 나란히 내려준다.
 */
export interface BreederPetPostingDraftPhotoUrls {
    /** form.photos 와 같은 순서 */
    pet: string[];
    /** form.parentPetSnapshots 와 같은 순서. 사진 없는 행은 null */
    parents: (string | null)[];
    breedingEnvironment: string | null;
}

export interface BreederPetPostingDraftDetailResult {
    draftId: string;
    form: BreederPetPostingDraftForm;
    photoUrls: BreederPetPostingDraftPhotoUrls;
    updatedAt: string;
}

export interface BreederPetPostingDraftDeleteResult {
    draftId: string;
    deleted: boolean;
}
