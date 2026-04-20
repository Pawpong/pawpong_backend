import { Inject, Injectable } from '@nestjs/common';

import { BreedAdminResultMapperService } from '../../../domain/services/breed-admin-result-mapper.service';
import { BREED_ADMIN_READER_PORT, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';
import { type BreedAdminItemResult } from '../types/breed-result.type';

@Injectable()
export class GetAllBreedsAdminUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER_PORT)
        private readonly breedAdminReader: BreedAdminReaderPort,
        private readonly breedAdminResultMapperService: BreedAdminResultMapperService,
    ) {}

    async execute(): Promise<BreedAdminItemResult[]> {
        const breeds = await this.breedAdminReader.readAll();
        return breeds.map((breed) => this.breedAdminResultMapperService.toResult(breed));
    }
}
