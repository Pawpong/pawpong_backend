import { Injectable } from '@nestjs/common';

import { AdopterRepository } from '../repository/adopter.repository';
import type {
    AdopterFavoriteListResult,
    AdopterFavoriteReaderPort,
} from '../application/ports/adopter-favorite-reader.port';

/**
 * AdopterFavoriteReaderPort 구현체.
 * 실제 조회는 AdopterRepository.findFavoriteList 에 위임한다 —
 * 즐겨찾기 쓰기(add/removeFavoriteBreeder)와 동일한 Repository 를 공유해
 * favoriteBreederList 접근 지점을 하나로 유지한다.
 */
@Injectable()
export class AdopterFavoriteReaderAdapter implements AdopterFavoriteReaderPort {
    constructor(private readonly adopterRepository: AdopterRepository) {}

    async findFavoriteList(adopterId: string, page: number, limit: number): Promise<AdopterFavoriteListResult> {
        return this.adopterRepository.findFavoriteList(adopterId, page, limit);
    }
}
