export const ADOPTION_PET_WRITER_PORT = Symbol('ADOPTION_PET_WRITER_PORT');

export interface AdoptionPetWriterPort {
    /**
     * 입양 상세 진입 시 호출. 새 viewCount 를 반환한다.
     * pet 이 없거나 isActive=false 면 null 을 반환한다 (use-case 가 사전 검증 후 호출하므로 일반 경로는 number).
     */
    incrementViewCount(petId: string): Promise<number | null>;
}
