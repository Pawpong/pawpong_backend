import { Inject, Injectable } from '@nestjs/common';

import { BreedResponseDto } from '../../../dto/response/breed-response.dto';
import { BreedAdminPresentationService } from '../../../domain/services/breed-admin-presentation.service';
import { BREED_ADMIN_READER, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';

@Injectable()
export class GetAllBreedsAdminUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER)
        private readonly breedAdminReader: BreedAdminReaderPort,
        private readonly breedAdminPresentationService: BreedAdminPresentationService,
    ) {}

    async execute(): Promise<BreedResponseDto[]> {
        const breeds = await this.breedAdminReader.readAll();
        return breeds.map((breed) => this.breedAdminPresentationService.toResponseDto(breed));
    }
}
