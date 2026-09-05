import { Injectable } from '@nestjs/common';

import { AdopterRepository } from '../repository/adopter.repository';
import { AdopterBreederFavoriteRepository } from '../repository/adopter-breeder-favorite.repository';
import type {
    AdopterFavoriteListResult,
    AdopterFavoriteReaderPort,
} from '../application/ports/adopter-favorite-reader.port';

/**
 * AdopterFavoriteReaderPort 구현체.
 * 실제 조회는 즐겨찾기 쓰기(add/removeFavoriteBreeder)와 동일한 Repository 에 위임해
 * favoriteBreederList 접근 지점을 하나로 유지한다.
 *
 * userRole 분기는 AdopterProfileAdapter.findFavoriteList 와 동일하다 —
 * 브리더가 담은 즐겨찾기는 Breeder.favoriteBreederList 에 저장되므로
 * 읽을 때도 같은 컬렉션을 봐야 한다(안 그러면 담기는 되는데 목록이 늘 비어 보인다).
 */
@Injectable()
export class AdopterFavoriteReaderAdapter implements AdopterFavoriteReaderPort {
    constructor(
        private readonly adopterRepository: AdopterRepository,
        private readonly adopterBreederFavoriteRepository: AdopterBreederFavoriteRepository,
    ) {}

    async findFavoriteList(
        userId: string,
        page: number,
        limit: number,
        userRole?: string,
    ): Promise<AdopterFavoriteListResult> {
        if (userRole === 'breeder') {
            return this.adopterBreederFavoriteRepository.findFavoriteList(userId, page, limit);
        }

        return this.adopterRepository.findFavoriteList(userId, page, limit);
    }
}
