import type {
    BreederPetPostingCreatePersistData,
    BreederPetPostingUpdatePersistData,
} from '../types/breeder-pet-posting-command.type';

export const BREEDER_PET_POSTING_WRITER_PORT = Symbol('BREEDER_PET_POSTING_WRITER_PORT');

export interface BreederPetPostingWriterPort {
    create(data: BreederPetPostingCreatePersistData): Promise<{ petId: string }>;

    /**
     * 작성자(breederId) 본인 + isActive=true 인 분양글만 갱신한다.
     * 본인 글 아니거나(다른 브리더 소유) 비활성/미존재면 changed=false 로 반환 — 호출측이 404 매핑.
     */
    updateByOwner(
        petId: string,
        breederId: string,
        patch: BreederPetPostingUpdatePersistData,
    ): Promise<{ changed: boolean }>;

    /**
     * 작성자 본인 + isActive=true 인 분양글을 soft delete (isActive=false).
     * 다른 도메인(adoption-application, favorite 등)이 참조하므로 hard delete 하지 않는다.
     */
    softDeleteByOwner(petId: string, breederId: string): Promise<{ changed: boolean }>;
}
