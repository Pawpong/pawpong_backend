import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    ADOPTER_PET_FAVORITE_WRITER_PORT,
    type AdopterPetFavoriteWriterPort,
} from '../ports/adopter-pet-favorite.port';
import { ADOPTION_PET_READER_PORT, type AdoptionPetReaderPort } from '../ports/adoption-pet-reader.port';

@Injectable()
export class AddAdoptionPetFavoriteUseCase {
    constructor(
        @Inject(ADOPTION_PET_READER_PORT)
        private readonly petReader: AdoptionPetReaderPort,
        @Inject(ADOPTER_PET_FAVORITE_WRITER_PORT)
        private readonly favoriteWriter: AdopterPetFavoriteWriterPort,
    ) {}

    async execute(adopterId: string, petId: string): Promise<{ added: boolean; favoriteCount: number }> {
        // 활성 펫(isActive=true) 만 즐겨찾기 추가 허용 — soft-deleted 펫에 stale 즐겨찾기 차단.
        // 기존 즐겨찾기 제거는 RemoveAdoptionPetFavoriteUseCase 가 readById(전체) 로 cleanup 허용.
        const pet = await this.petReader.readActiveById(petId);
        if (!pet) {
            throw new BadRequestException('해당 동물을 찾을 수 없습니다.');
        }

        const result = await this.favoriteWriter.addAtomic(adopterId, petId);
        return { added: result.changed, favoriteCount: result.favoriteCount };
    }
}
