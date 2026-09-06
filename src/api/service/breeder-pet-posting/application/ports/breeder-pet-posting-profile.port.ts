import type { PostingPetType } from '../types/breeder-pet-posting-command.type';

export const BREEDER_PET_POSTING_PROFILE_PORT = Symbol('BREEDER_PET_POSTING_PROFILE_PORT');

export interface BreederPetPostingProfileSnapshot {
    breederId: string;
    /**
     * 브리더 계정의 축종. 분양글 petType 은 항상 이 값에서 파생한다.
     * (브리더 1명 = 1축종이므로 클라이언트 입력을 신뢰하지 않는다)
     *
     * breeder.schema 의 petType 은 required 지만, enum 밖 값이 남아 있는 레거시 문서를 위해
     * 판별 불가한 경우 undefined 로 내려 호출자가 명시적으로 처리하게 한다.
     */
    petType?: PostingPetType;
}

export interface BreederPetPostingProfilePort {
    /**
     * 입양자/관리자가 아닌 활성 브리더 계정만 식별한다.
     * 호출자(use-case)에서 권한 검사는 StrictRolesGuard 가 이미 수행했으므로
     * 본 port 는 단순 존재 검증과 축종 조회만 수행한다 (브리더 도큐먼트가 존재하지 않으면 null).
     */
    findById(userId: string): Promise<BreederPetPostingProfileSnapshot | null>;
}
