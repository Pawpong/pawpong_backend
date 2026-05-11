import type { AdoptionApplicationContext } from '../types/adoption-application.type';

export const ADOPTION_APPLICATION_CONTEXT_PORT = Symbol('ADOPTION_APPLICATION_CONTEXT_PORT');

export interface AdoptionApplicationContextPort {
    /**
     * petId 로 분양 펫 + 그 펫의 breeder + adopter 정보 (이름/이메일/전화 비정규화 캐싱용)를
     * 한 번에 조회한다.
     * 펫이 없거나 비활성이거나 입양 완료 상태면 null.
     */
    readContext(petId: string, adopterId: string): Promise<AdoptionApplicationContext | null>;
}
