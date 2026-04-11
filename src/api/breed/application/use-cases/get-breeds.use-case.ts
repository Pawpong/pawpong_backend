import { Inject, Injectable } from '@nestjs/common';

import { BREED_READER_PORT, type BreedReaderPort } from '../ports/breed-reader.port';
import { BreedCatalogService } from '../../domain/services/breed-catalog.service';
import { type GetBreedsResult } from '../types/breed-query-result.type';

@Injectable()
export class GetBreedsUseCase {
    constructor(
        @Inject(BREED_READER_PORT)
        private readonly breedReader: BreedReaderPort,
        private readonly breedCatalogService: BreedCatalogService,
    ) {}

    async execute(petType: string): Promise<GetBreedsResult> {
        const categories = await this.breedReader.readByPetType(petType);
        return this.breedCatalogService.buildResponse(petType, categories);
    }
}
