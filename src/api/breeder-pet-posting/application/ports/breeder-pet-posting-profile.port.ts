export const BREEDER_PET_POSTING_PROFILE_PORT = Symbol('BREEDER_PET_POSTING_PROFILE_PORT');

export interface BreederPetPostingProfileSnapshot {
    breederId: string;
}

export interface BreederPetPostingProfilePort {
    /**
     * 입양자/관리자가 아닌 활성 브리더 계정만 식별한다.
     * 호출자(use-case)에서 권한 검사는 StrictRolesGuard 가 이미 수행했으므로
     * 본 port 는 단순 존재 검증만 수행한다 (브리더 도큐먼트가 존재하지 않으면 null).
     */
    findById(userId: string): Promise<BreederPetPostingProfileSnapshot | null>;
}
