import { Injectable } from '@nestjs/common';

import { BreedReaderPort, BreedCategorySnapshot } from '../application/ports/breed-reader.port';
import { BreedRepository } from '../repository/breed.repository';

@Injectable()
export class BreedMongooseReaderAdapter implements BreedReaderPort {
    constructor(private readonly breedRepository: BreedRepository) {}

    async readByPetType(petType: string): Promise<BreedCategorySnapshot[]> {
        const results = await this.breedRepository.findByPetType(petType);

        return results.map((result) => ({
            category: result.category,
            categoryDescription: result.categoryDescription,
            breeds: result.breeds,
        }));
    }
}
