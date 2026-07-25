import type { AdopterFavoriteRecord } from '../../types/adopter-profile.type';

export const ADOPTER_FAVORITE_READER_PORT = Symbol('ADOPTER_FAVORITE_READER_PORT');

export interface AdopterFavoriteListResult {
    favorites: AdopterFavoriteRecord[];
    total: number;
}

/**
 * Adopter.favoriteBreederList(즐겨찾기 브리더 임베디드 배열) 읽기 전용 Port.
 *
 * - adopter 도메인이 즐겨찾기 데이터(favoriteBreederList)의 유일한 쓰기 소유자이며,
 *   이 Port 는 그 원본 데이터를 페이지 단위로 읽는 유일한 창구다.
 * - profile 등 다른 바운디드 컨텍스트가 같은 데이터를 조회해야 할 때는
 *   Mongo 쿼리를 직접 재구현하지 말고 이 Port 를 통해서만 접근한다.
 * - 정렬 기준은 addedAt 내림차순(최근 즐겨찾기 추가순)으로 고정한다.
 */
export interface AdopterFavoriteReaderPort {
    findFavoriteList(adopterId: string, page: number, limit: number): Promise<AdopterFavoriteListResult>;
}
