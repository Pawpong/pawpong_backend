import type {
    BreederPetPostingDraftForm,
    BreederPetPostingDraftSnapshot,
} from '../types/breeder-pet-posting-draft.type';

export const BREEDER_PET_POSTING_DRAFT_PORT = Symbol('BREEDER_PET_POSTING_DRAFT_PORT');

/**
 * v2 분양글 임시저장 저장소 경계.
 * 모든 조작은 breederId 소유자 스코프로 제한된다 — 다른 브리더의 draft 는 존재하지 않는 것처럼 다룬다.
 */
export interface BreederPetPostingDraftPort {
    create(breederId: string, form: BreederPetPostingDraftForm): Promise<{ draftId: string }>;

    /** 본인 draft 덮어쓰기. 미존재/타인 소유면 updated=false */
    updateByOwner(draftId: string, breederId: string, form: BreederPetPostingDraftForm): Promise<{ updated: boolean }>;

    /** 내 draft 목록 (updatedAt 최신순) */
    listByOwner(breederId: string): Promise<BreederPetPostingDraftSnapshot[]>;

    /** 본인 draft 단건. 미존재/타인 소유면 null */
    findByOwner(draftId: string, breederId: string): Promise<BreederPetPostingDraftSnapshot | null>;

    /** 본인 draft 삭제 (hard delete). 미존재/타인 소유면 deleted=false */
    deleteByOwner(draftId: string, breederId: string): Promise<{ deleted: boolean }>;

    /** 내 draft 개수 — 저장 상한 검증용 */
    countByOwner(breederId: string): Promise<number>;
}
