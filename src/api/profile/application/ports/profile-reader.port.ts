import type {
    AdopterProfileSnapshot,
    BreederProfileSnapshot,
    FavoriteBreederCardSnapshot,
} from '../types/profile.type';

export const PROFILE_READER_PORT = Symbol('PROFILE_READER_PORT');

export interface FavoriteBreedersPageResult {
    items: FavoriteBreederCardSnapshot[];
    totalItems: number;
}

export interface ProfileReaderPort {
    readAdopter(userId: string): Promise<AdopterProfileSnapshot | null>;
    readBreeder(breederId: string): Promise<BreederProfileSnapshot | null>;
    /**
     * 본인 마이홈 — 즐겨찾는 브리더 카드 페이지네이션.
     * 입양자의 favoriteBreederList 임베디드 배열을 페이지로 잘라
     * 브리더 본 도큐먼트의 nickname/profileImageFileName/level/bpm 으로 채워준다.
     */
    listFavoriteBreeders(
        adopterId: string,
        pagination: { page: number; pageSize: number },
    ): Promise<FavoriteBreedersPageResult>;

    /**
     * 입양자가 특정 브리더를 즐겨찾기했는지 여부 (브리더 공개 프로필 응답의 isFavorited 채움).
     */
    isFavoritedBy(adopterId: string, breederId: string): Promise<boolean>;
}
