import type { AdoptionPetSnapshot, AdoptionPetStatus } from './adoption-pet-reader.port';

export const ADOPTER_PET_FAVORITE_READER_PORT = Symbol('ADOPTER_PET_FAVORITE_READER_PORT');
export const ADOPTER_PET_FAVORITE_WRITER_PORT = Symbol('ADOPTER_PET_FAVORITE_WRITER_PORT');

export interface AdopterFavoritedPetsListResult {
    snapshots: AdoptionPetSnapshot[];
    totalItems: number;
}

export interface AdopterFavoritedPetsListQuery {
    statusFilter?: AdoptionPetStatus;
    skip: number;
    limit: number;
}

export interface AdopterPetFavoriteReaderPort {
    isFavorited(adopterId: string, petId: string): Promise<boolean>;
    findFavoritedPetIds(adopterId: string, petIds: string[]): Promise<Set<string>>;
    /**
     * 입양자의 즐겨찾기 펫 목록 — 즐겨찾기 추가 시각 desc 정렬, status 필터 가능.
     * 카드 응답을 한 번에 만들 수 있도록 펫 도큐먼트와 join 한 snapshot 을 반환한다.
     * 비활성 펫(isActive=false) 은 제외한다.
     */
    listMyFavoritedPets(
        adopterId: string,
        query: AdopterFavoritedPetsListQuery,
    ): Promise<AdopterFavoritedPetsListResult>;
}

export type FavoriteAtomicResult = {
    /** 추가/제거가 실제로 반영되었는지 (idempotent 미반영 시 false) */
    changed: boolean;
    /** 트랜잭션 종료 후 권위적인 favoriteCount (clamp 결과 반영) */
    favoriteCount: number;
};

export interface AdopterPetFavoriteWriterPort {
    /**
     * 즐겨찾기 추가 + favoriteCount 증가를 단일 트랜잭션으로 수행한다.
     * 이미 존재하면 changed=false, 카운터 그대로.
     */
    addAtomic(adopterId: string, petId: string): Promise<FavoriteAtomicResult>;

    /**
     * 즐겨찾기 제거 + favoriteCount 감소를 단일 트랜잭션으로 수행한다.
     * 존재하지 않으면 changed=false. 카운터는 0 미만으로 떨어지지 않도록 clamp.
     */
    removeAtomic(adopterId: string, petId: string): Promise<FavoriteAtomicResult>;
}
