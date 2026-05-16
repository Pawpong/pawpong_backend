export const ADOPTION_PET_WRITER_PORT = Symbol('ADOPTION_PET_WRITER_PORT');

export interface AdoptionPetWriterPort {
    /**
     * 입양 상세 진입 시 호출. 새 viewCount 를 반환한다.
     * pet 이 없거나 isActive=false 면 null 을 반환한다.
     */
    incrementViewCount(petId: string): Promise<number | null>;
}
