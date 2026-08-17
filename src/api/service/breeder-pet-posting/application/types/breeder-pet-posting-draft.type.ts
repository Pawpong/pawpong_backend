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

export interface BreederPetPostingDraftDetailResult {
    draftId: string;
    form: BreederPetPostingDraftForm;
    updatedAt: string;
}

export interface BreederPetPostingDraftDeleteResult {
    draftId: string;
    deleted: boolean;
}
