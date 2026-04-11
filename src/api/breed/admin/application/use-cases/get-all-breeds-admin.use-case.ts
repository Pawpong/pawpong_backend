import { Inject, Injectable } from '@nestjs/common';

import { BreedAdminPresentationService } from '../../../domain/services/breed-admin-presentation.service';
import { BREED_ADMIN_READER_PORT, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';
import { type BreedAdminItemResult } from '../types/breed-result.type';

@Injectable()
export class GetAllBreedsAdminUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER_PORT)
        private readonly breedAdminReader: BreedAdminReaderPort,
        private readonly breedAdminPresentationService: BreedAdminPresentationService,
    ) {}

    async execute(): Promise<BreedAdminItemResult[]> {
        const breeds = await this.breedAdminReader.readAll();
        return breeds.map((breed) => this.breedAdminPresentationService.toResponseDto(breed));
    }
}
