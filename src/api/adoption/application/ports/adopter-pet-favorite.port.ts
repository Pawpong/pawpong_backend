export const ADOPTER_PET_FAVORITE_READER_PORT = Symbol('ADOPTER_PET_FAVORITE_READER_PORT');
export const ADOPTER_PET_FAVORITE_WRITER_PORT = Symbol('ADOPTER_PET_FAVORITE_WRITER_PORT');

export interface AdopterPetFavoriteReaderPort {
    isFavorited(adopterId: string, petId: string): Promise<boolean>;
    findFavoritedPetIds(adopterId: string, petIds: string[]): Promise<Set<string>>;
}

export interface AdopterPetFavoriteWriterPort {
    /**
     * 즐겨찾기 추가. 이미 존재하면 false 반환 (idempotent).
     */
    add(adopterId: string, petId: string): Promise<boolean>;

    /**
     * 즐겨찾기 제거. 존재하지 않으면 false 반환 (idempotent).
     */
    remove(adopterId: string, petId: string): Promise<boolean>;
}
