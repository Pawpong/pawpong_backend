import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    ADOPTER_PET_FAVORITE_WRITER_PORT,
    type AdopterPetFavoriteWriterPort,
} from '../ports/adopter-pet-favorite.port';
import {
    ADOPTION_PET_READER_PORT,
    type AdoptionPetReaderPort,
} from '../ports/adoption-pet-reader.port';

@Injectable()
export class RemoveAdoptionPetFavoriteUseCase {
    constructor(
        @Inject(ADOPTION_PET_READER_PORT)
        private readonly petReader: AdoptionPetReaderPort,
        @Inject(ADOPTER_PET_FAVORITE_WRITER_PORT)
        private readonly favoriteWriter: AdopterPetFavoriteWriterPort,
    ) {}

    async execute(adopterId: string, petId: string): Promise<{ removed: boolean; favoriteCount: number }> {
        const pet = await this.petReader.readById(petId);
        if (!pet) {
            throw new BadRequestException('해당 동물을 찾을 수 없습니다.');
        }

        const removed = await this.favoriteWriter.remove(adopterId, petId);
        if (removed) {
            await this.petReader.incrementFavoriteCount(petId, -1);
        }

        const refreshed = await this.petReader.readById(petId);
        return {
            removed,
            favoriteCount: Math.max(0, refreshed?.favoriteCount ?? pet.favoriteCount),
        };
    }
}
